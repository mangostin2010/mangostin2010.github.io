from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
import os
import random

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

def list_folders(directory):
    # Ensure the path is correct and exists
    if not os.path.exists(directory):
        return []

    # Get all directories in the given path
    folders = [name for name in os.listdir(directory) if os.path.isdir(os.path.join(directory, name))]
    return folders

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
    directory = os.path.join('assets', 'images', 'community')
    
    # Get list of folders
    folders = list_folders(directory)
    folders.reverse()
    
    # Return as JSON response
    return jsonify(folders)

@app.route('/list_images/<path:folder>', methods=['GET'])
def get_images(folder):
    # URL-decode the folder name
    folder = os.path.normpath(folder)
    
    # Specify the directory
    directory = os.path.join('assets', 'images', 'community', folder)
    
    # Get list of images
    images = list_images(directory)
    
    # Return as JSON response
    return jsonify(images)


@app.route('/random_images/<path:folder>', methods=['GET'])
def get_random_images(folder):
    # URL-decode the folder name
    folder = os.path.normpath(folder)
    
    # Specify the directory
    directory = os.path.join('assets', 'images', 'community', folder)
    
    # Get list of images
    images = list_images(directory)
    
    # Return as JSON response
    return jsonify(random.choice(images))



@app.route('/files/<path:filename>')
def serve_file(filename):
    return send_from_directory('static_files', filename)


if __name__ == '__main__':
    app.run(debug=True, host='172.30.1.34')