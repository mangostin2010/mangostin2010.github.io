import os
import json

images_dir = 'assets/images/community'  # adjust this path if your images are not in a 'galleries' folder at root

def generate_gallery_json():
    directories = [d for d in os.listdir(images_dir) if os.path.isdir(os.path.join(images_dir, d))]
    gallery_structure = {dir: os.listdir(os.path.join(images_dir, dir)) for dir in directories}
    
    with open('gallery-structure.json', 'w') as json_file:
        json.dump(gallery_structure, json_file, indent=2)

if __name__ == "__main__":
    generate_gallery_json()
