import os
from pathlib import Path
import re

def rename_images_in_directories():
    # Get current directory
    assets = Path.cwd() / "src/lib/assets/content-list"

    # Find all directories in the current directory
    for directory in assets.iterdir():
        if directory.is_dir():
            # Find all image files in the directory
            image_files = []
            for file in directory.iterdir():
                if file.is_file() and file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']:
                    image_files.append(file)

            # Sort files to maintain consistent ordering
            image_files.sort()

            # Rename files
            if len(image_files) == 1:
                # Single file: rename to thumbnail.extension
                file = image_files[0]
                new_name = directory / f"thumbnail{file.suffix}"
                file.rename(new_name)
                print(f"Renamed: {file.name} -> thumbnail{file.suffix}")
            elif len(image_files) > 1:
                # Multiple files: rename to thumbnail-0.extension, thumbnail-1.extension, etc.
                for i, file in enumerate(image_files):
                    new_name = directory / f"thumbnail-{i}{file.suffix}"
                    file.rename(new_name)
                    print(f"Renamed: {file.name} -> thumbnail-{i}{file.suffix}")
            else:
                print(f"No image files found in {directory.name}")

if __name__ == "__main__":
    rename_images_in_directories()
    print("Renaming complete!")
