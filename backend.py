version = '1.1'

import os
import base64
import datetime
import random
import json
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from werkzeug.utils import secure_filename
import requests
import logging
from concurrent.futures import ThreadPoolExecutor
import time
from functools import lru_cache

from g4f.client import Client
import g4f

from flask import Flask, request, jsonify
import asyncio
import aiohttp
from typing import List, Dict
from flask_cors import CORS
import json
import nest_asyncio
from flask import Flask, request, jsonify, make_response

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Enable nested event loops
nest_asyncio.apply()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)

# GitHub API details
USERNAME = "mangostin2010"
REPO = "mangostin2010.github.io"
BASE_PATH = "assets/images/community"
TOKEN = os.environ.get("GITHUB_TOKEN")
TOKEN = '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'
EVENT_LIST_PATH = 'assets/eventList.json'
HEADERS = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}
announce_path = 'announce.json'

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

# Cache for folder image lists with LRU cache (replaces manual caching logic)
@lru_cache(maxsize=128)
def list_images(directory):
    url = f"https://api.github.com/repos/{USERNAME}/{REPO}/contents/{BASE_PATH}/{directory}"
    contents = github_api_request(url)
    image_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg')
    return [item['name'] for item in contents if item['type'] == 'file' and item['name'].lower().endswith(image_extensions)] if contents else []

def get_images_cached(directory):
    # Check if the cache is valid
    cache_entry = image_cache.get(directory)
    if cache_entry and (time.time() - cache_entry['timestamp'] < CACHE_EXPIRATION_SECONDS):
        logging.debug(f"Using cached images for folder '{directory}'")
        return cache_entry['images']

    # Cache is expired or nonexistent; fetch fresh data
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
        images = list_images(folder)  # Directly use LRU cached list_images
        return jsonify(images)
    except Exception as e:
        return jsonify({"error": f"Failed to list images: {str(e)}"}), 500

@app.route('/random_images/<path:folder>', methods=['GET'])
def get_random_images(folder):
    try:
        images = list_images(folder)  # Directly use LRU cached list_images
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
        date = data.get('date', datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime("%Y.%m.%d"))
        image_data = data.get('image')

        if not image_data:
            return jsonify({"error": "No image data provided"}), 400

        image_data = base64.b64decode(image_data.split(',')[1])
        filename = secure_filename(f"{title}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")

        formatted_folder_name = f"{date}[]{title}"
        api_url = f"https://api.github.com/repos/{USERNAME}/{REPO}/contents/{BASE_PATH}/{formatted_folder_name}/{filename}"
        encoded_image = base64.b64encode(image_data).decode("utf-8")

        upload_data = {
            "message": f"Upload {filename} to {formatted_folder_name}",
            "content": encoded_image,
            "branch": "main"
        }
        response = github_api_request(api_url, method='PUT', data=upload_data)
        return jsonify({"status": "success", "message": "Image uploaded successfully"}), 200 if response else jsonify({"status": "error", "message": "Failed to upload image"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/announce')
def announce():

    url = "https://raw.githubusercontent.com/mangostin2010/mangostin2010.github.io/refs/heads/main/announce.json"
    response = requests.get(url)
    data = response.json()
    print(data['message'])


    # 임시 공지 내용
    notice_message = data['message']
    notice_image = data['image']

    if not notice_message.strip():
        return jsonify({})

    # JSON 형식으로 공지 메시지와 이미지 경로를 반환
    return jsonify(data)

@app.route('/add_announce', methods=['POST'])
def add_announce():
    try:
        # Get data from the form
        message = request.form.get('message')
        image = request.form.get('image', '')

        # Structure the announcement data
        announce_data = {
            "message": message,
            "image": image
        }

        # Define the file path in the GitHub repo

        # Fetch the existing file to get its SHA
        url = "https://api.github.com/repos/mangostin2010/mangostin2010.github.io/contents/announce.json"
        response = github_api_request(url)
        if not response:
            return jsonify({"error": "Could not fetch announce.json"}), 500

        sha = response['sha']

        # Encode the updated announce data in base64
        encoded_data = base64.b64encode(json.dumps(announce_data).encode("utf-8")).decode("utf-8")
        update_data = {
            "message": "Update announcement",
            "content": encoded_data,
            "sha": sha,
            "branch": "main"
        }

        # Update the file on GitHub
        update_response = github_api_request(url, method='PUT', data=update_data)
        if update_response:
            return jsonify({"status": "success", "message": "Announcement updated"}), 200
        else:
            return jsonify({"status": "error", "message": "Failed to update announcement"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Correct password for the admin page
CORRECT_PASSWORD = os.environ.get("ADMIN_PASSWORD")

@app.route('/check_password', methods=['POST'])
def check_password():
    data = request.json
    password = data.get('password')

    # Check if the provided password is correct
    if password == CORRECT_PASSWORD:
        return jsonify({"status": "success", "message": "Access granted!"})
    else:
        return jsonify({"status": "error", "message": "Incorrect password"}), 401

# Add error handler
@app.errorhandler(Exception)
def handle_error(error):
    logging.error(f"Unhandled error: {str(error)}")
    return jsonify({'error': str(error)}), 500

# Function to send an email
def send_email(to_email, subject, body):
    smtp_server = "smtp.gmail.com"  # SMTP server (Gmail in this case)
    smtp_port = 587  # SMTP port
    sender_email = os.environ.get("SENDER_EMAIL")  # Replace with your email
    sender_email = 'swcis.kr@gmail.com'
    sender_password = os.environ.get("SENDER_PASSWORD")  # Replace with your email password or app-specific password
    sender_password = 'rzxm dvfm ofca hswk'

    try:
        # Create the email
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        # Connect to the SMTP server and send the email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Upgrade the connection to secure (TLS)
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print("Email sent successfully.")
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

@app.route('/submit_form', methods=['POST'])
def submit_form():
    try:
        form_data = request.form
        print("Received form data:", form_data)  # Debugging log
        name = form_data.get('name')  # Use 'name' from the HTML form's 'name' attribute
        gender = form_data.get('gender')  # Use 'gender' from the HTML form's 'name' attribute
        age = form_data.get('age')  # Use 'age' from the HTML form's 'name' attribute
        admission_date = form_data.get('admission_date')  # Use 'admission_date' from the HTML form's 'name' attribute
        current_school = form_data.get('current_school')  # Use 'current_school' from the HTML form's 'name' attribute
        english_level = form_data.get('english_level')  # Use 'english_level' from the HTML form's 'name' attribute
        questions = form_data.get('questions')  # Use 'questions' from the HTML form's 'name' attribute
        contact_preference = form_data.get('contact_preference')  # Use 'contact_preference' from the HTML form's 'name' attribute

        # Prepare email content
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

        # Send email
        recipient_email = "scis@outlook.kr"  # Replace with your desired recipient
        recipient_email = "mangostin2010@gmail.com"
        if send_email(recipient_email, subject, body):
            return jsonify({"message": "Form submitted and email sent successfully!"}), 200
        else:
            return jsonify({"message": "Failed to send email."}), 500
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860)