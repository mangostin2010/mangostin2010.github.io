version = '1.1'

import os
import base64
import datetime
from datetime import datetime
import random
import json
from flask import Flask, jsonify, request, make_response, abort
from flask_cors import CORS
from werkzeug.utils import secure_filename
import requests
import logging
from functools import lru_cache
import time

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import nest_asyncio
nest_asyncio.apply()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)

# GitHub API details (필요한 경우 유지)
USERNAME = "mangostin2010"
REPO = "mangostin2010.github.io"
BASE_PATH = "assets/images/community"
TOKEN = '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'
EVENT_LIST_PATH = 'assets/eventList.json'
HEADERS = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

session = requests.Session()
session.headers.update(HEADERS)

# Cache for folder image lists with expiration
image_cache = {}
CACHE_EXPIRATION_SECONDS = 300  # Cache for 5 minutes

def github_api_request(url, method='GET', data=None):
    try:
        response = session.request(method, url, json=data)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logging.error(f"Request error: {e}")
        return None

def get_event_list():
    url = f"https://api.github.com/repos/{USERNAME}/{REPO}/contents/{EVENT_LIST_PATH}"
    response = github_api_request(url)
    if response:
        content = base64.b64decode(response['content']).decode('utf-8')
        return json.loads(content), response['sha']
    return {}, None

def update_event_list(data, sha):
    url = f"https://api.github.com/repos/{USERNAME}/{REPO}/contents/{EVENT_LIST_PATH}"
    encoded_data = base64.b64encode(json.dumps(data).encode("utf-8")).decode("utf-8")
    update_data = {
        "message": "Update event list",
        "content": encoded_data,
        "sha": sha,
        "branch": "main"
    }
    return github_api_request(url, method='PUT', data=update_data)

def list_folders():
    url = f"https://api.github.com/repos/{USERNAME}/{REPO}/contents/{BASE_PATH}"
    contents = github_api_request(url)
    return [item['name'] for item in contents if item['type'] == 'dir'] if contents else []

@lru_cache(maxsize=128)
def list_images(directory):
    url = f"https://api.github.com/repos/{USERNAME}/{REPO}/contents/{BASE_PATH}/{directory}"
    contents = github_api_request(url)
    image_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg')
    return [item['name'] for item in contents if item['type'] == 'file' and item['name'].lower().endswith(image_extensions)] if contents else []

def get_images_cached(directory):
    cache_entry = image_cache.get(directory)
    if cache_entry and (time.time() - cache_entry['timestamp'] < CACHE_EXPIRATION_SECONDS):
        logging.debug(f"Using cached images for folder '{directory}'")
        return cache_entry['images']

    images = list_images(directory)
    image_cache[directory] = {'images': images, 'timestamp': time.time()}
    return images

@app.route('/list_folders', methods=['GET'])
def get_folders():
    try:
        folders = list_folders()
        return jsonify(sorted(folders, reverse=True))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/list_images/<path:folder>', methods=['GET'])
def get_images(folder):
    try:
        images = list_images(folder)
        return jsonify(images)
    except Exception as e:
        return jsonify({"error": f"Failed to list images: {str(e)}"}), 500

@app.route('/random_images/<path:folder>', methods=['GET'])
def get_random_images(folder):
    try:
        images = list_images(folder)
        if images:
            return jsonify(random.choice(images))
        return jsonify({"error": f"No images found in folder '{folder}'"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to get random image: {str(e)}"}), 500

@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        data = request.json
        title = data.get('title', 'untitled')
        date_str = data.get('date', datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime("%Y.%m.%d"))
        images_data = data.get('images', [])  # Now expecting a list of images
        
        if not images_data:
            return jsonify({"error": "No images provided"}), 400
        
        # If a single image is provided (for backward compatibility)
        if isinstance(images_data, str):
            images_data = [images_data]
            
        uploaded_files = []
        formatted_folder_name = f"{date_str}[]{title}"
        
        for idx, image_data in enumerate(images_data):
            # base64 data가 "data:image/png;base64,..." 형태일 수 있어 split 처리
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            filename = secure_filename(f"{title}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{idx}.png")
            
            api_url = f"https://api.github.com/repos/{USERNAME}/{REPO}/contents/{BASE_PATH}/{formatted_folder_name}/{filename}"
            encoded_image = base64.b64encode(image_bytes).decode("utf-8")
            
            upload_data = {
                "message": f"Upload {filename} to {formatted_folder_name}",
                "content": encoded_image,
                "branch": "main"
            }
            
            response = github_api_request(api_url, method='PUT', data=upload_data)
            if response:
                uploaded_files.append(filename)
            else:
                logging.error(f"Failed to upload image {idx+1}")
        
        if uploaded_files:
            return jsonify({
                "status": "success", 
                "message": f"Successfully uploaded {len(uploaded_files)} of {len(images_data)} images",
                "uploaded_files": uploaded_files
            }), 200
        else:
            return jsonify({"status": "error", "message": "Failed to upload any images"}), 500
    except Exception as e:
        logging.error(f"Error in upload_image: {str(e)}")
        return jsonify({"error": str(e)}), 500

# --- 공지사항 (announce.json) 로컬 파일 기반 API 추가/수정 ---

ANNOUNCE_FILE = os.path.join(os.path.dirname(__file__), 'announce.json')

current_announcement = {
    'message': '',
    'image': []  # Changed from string to array
}

def load_announcement():
    if os.path.exists(ANNOUNCE_FILE):
        try:
            with open(ANNOUNCE_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                current_announcement['message'] = data.get('message', '')
                
                # Handle both string and array formats for backward compatibility
                image_data = data.get('image', [])
                if isinstance(image_data, str) and image_data:
                    current_announcement['image'] = [image_data]
                elif isinstance(image_data, list):
                    current_announcement['image'] = image_data
                else:
                    current_announcement['image'] = []
        except Exception as e:
            logging.error(f"Failed to load announcement: {e}")

def save_announcement(data):
    try:
        with open(ANNOUNCE_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        return True
    except Exception as e:
        logging.error(f"Failed to save announcement: {e}")
        return False

load_announcement()

@app.route('/api/announcement', methods=['GET'])
def get_announcement():
    return jsonify(current_announcement)

@app.route('/api/announcement', methods=['POST'])
def update_announcement():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    message = data.get('message', '')
    images = data.get('image', [])
    
    # Handle both string and array formats for backward compatibility
    if isinstance(images, str):
        images = [images] if images else []
    
    current_announcement['message'] = message
    current_announcement['image'] = images

    if save_announcement(current_announcement):
        return jsonify({'success': True, 'announcement': current_announcement})
    else:
        return jsonify({'success': False, 'error': 'Failed to save announcement'}), 500

# --- 이메일 전송 기능 및 폼 제출 ---

# 로그인 정보는 보안을 위해 환경변수 등으로 교체 권장
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = 'swcis.kr@gmail.com'
SENDER_PASSWORD = 'rzxm dvfm ofca hswk'  # 실제로는 안전하게 관리하세요

def send_email(to_email, subject, body):
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        logging.info("Email sent successfully.")
        return True
    except Exception as e:
        logging.error(f"Error sending email: {e}")
        return False

@app.route('/submit_form', methods=['POST'])
def submit_form():
    try:
        if request.is_json:
            data = request.json
        else:
            data = request.form.to_dict()

        logging.info(f"Received form data: {data}")

        name = data.get('name')
        gender = data.get('gender')
        age = data.get('age')
        admission_date = data.get('admission_date')
        current_school = data.get('current_school')
        english_level = data.get('english_level')
        questions = data.get('questions')
        contact_preference = data.get('contact_preference')

        subject = "새로운 양식 제출"
        body = f"""
새로운 양식 제출이 접수되었습니다:
이름: {name}
성별: {gender}
나이: {age}
입학을 원하는 시기: {admission_date}
현재 다니는 학교: {current_school}
영어 이해도: {english_level}
기타 질문: {questions}
연락 방법: {contact_preference}
"""

        recipient_emails = ["scisjustin@gmail.com", "scis@outlook.kr"]
        email_send_success = True

        for email in recipient_emails:
            if not send_email(email, subject, body):
                email_send_success = False

        if email_send_success:
            return jsonify({"message": "Form submitted and emails sent successfully!"}), 200
        else:
            return jsonify({"message": "Failed to send one or more emails."}), 500
    except Exception as e:
        logging.error(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500

# --- 게시글 API ---

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'posts.json')

def load_posts():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

def save_posts(posts):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(posts, f, ensure_ascii=False, indent=4)

PASSWORD = "mysecretpassword"

@app.route('/api/posts', methods=['GET'])
def get_posts():
    posts = load_posts()
    return jsonify(posts)

@app.route('/api/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    posts = load_posts()
    post = next((post for post in posts if post['id'] == post_id), None)
    if post is None:
        abort(404)
    return jsonify(post)

@app.route('/api/posts', methods=['POST'])
def create_post():
    if not request.json or not 'title' in request.json or not 'content' in request.json or not 'password' in request.json:
        abort(400)
    if request.json['password'] != PASSWORD:
        return jsonify({"message": "비밀번호가 일치하지 않습니다."}), 401

    posts = load_posts()
    new_post = {
        'id': posts[-1]['id'] + 1 if posts else 1,
        'title': request.json['title'],
        'content': request.json['content'],
        'date': datetime.now().isoformat(),
    }
    posts.append(new_post)
    save_posts(posts)
    return jsonify(new_post), 201

@app.route('/api/check_password', methods=['POST'])
def check_password_api():
    data = request.get_json()
    if not data or 'password' not in data:
        return jsonify({"message": "비밀번호를 입력해주세요."}), 400

    received_password = data['password'].strip()

    if received_password != PASSWORD:
        return jsonify({"message": "비밀번호가 일치하지 않습니다."}), 401

    return jsonify({"message": "인증 성공"}), 200

@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    if not request.json or not 'password' in request.json:
        abort(400)
    if request.json['password'] != PASSWORD:
        return jsonify({"message": "비밀번호가 일치하지 않습니다."}), 401

    posts = load_posts()
    post = next((post for post in posts if post['id'] == post_id), None)
    if post is None:
        abort(404)

    posts = [p for p in posts if p['id'] != post_id]
    save_posts(posts)
    return jsonify({"message": "포스트가 삭제되었습니다."}), 200

# --- 에러 핸들러 ---

@app.errorhandler(Exception)
def handle_error(error):
    logging.error(f"Unhandled error: {str(error)}")
    return jsonify({'error': str(error)}), 500

if __name__ == '__main__':
    app.run(debug=True)