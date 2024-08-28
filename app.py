from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
import random
import requests
import os

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

def list_folders():
    # Your GitHub details
    username = "mangostin2010"
    repo = "mangostin2010.github.io"
    path = "assets/images/community"

    # Your personal access token
    token = "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"

    # GitHub API endpoint
    url = f"https://api.github.com/repos/{username}/{repo}/contents/{path}"

    # Headers for authentication
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    # Send GET request to the GitHub API
    response = requests.get(url, headers=headers)

    # Check if the request was successful
    if response.status_code == 200:
        contents = response.json()
        folders = [item['name'] for item in contents if item['type'] == 'dir']
        return folders
    else:
        print(f"Error: Unable to fetch repository contents. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def list_folders_sorted(directory):
    # Ensure the path is correct and exists
    if not os.path.exists(directory):
        return []

    # Get all directories in the given path
    folders = [name for name in os.listdir(directory) if os.path.isdir(os.path.join(directory, name))]

    # Sort folders by modification time
    folders_sorted = sorted(folders, key=lambda f: os.path.getmtime(os.path.join(directory, f)), reverse=True)
    return folders_sorted

def list_images(directory):
    # Ensure the path is correct and exists
    if not os.path.exists(directory):
        return []

    # Get all files in the given path that are images
    images = [name for name in os.listdir(directory) if os.path.isfile(os.path.join(directory, name)) and name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))]
    return images

@app.route('/list_folders', methods=['GET'])
def get_folders():
    # Specify the directory
    #directory = os.path.join('school_website', 'assets', 'images', 'community')

    # Get list of folders sorted by modification time
    #folders = list_folders_sorted(directory)

    folders = list_folders()
    # Return as JSON response
    return jsonify(folders)

@app.route('/list_images/<path:folder>', methods=['GET'])
def get_images(folder):
    # URL-decode the folder name
    folder = os.path.normpath(folder)

    # Specify the directory
    directory = os.path.join('school_website', 'assets', 'images', 'community', folder)

    # Get list of images
    images = list_images(directory)

    # Return as JSON response
    return jsonify(images)

@app.route('/random_images/<path:folder>', methods=['GET'])
def get_random_images(folder):
    # URL-decode the folder name
    folder = os.path.normpath(folder)

    # Specify the directory
    directory = os.path.join('school_website', 'assets', 'images', 'community', folder)

    # Get list of images
    images = list_images(directory)

    # Return as JSON response
    return jsonify(random.choice(images))

@app.route('/files/<path:filename>')
def serve_file(filename):
    return send_from_directory('static_files', filename)


if __name__ == '__main__':
    app.run(debug=True)