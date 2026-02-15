import csv
import os
import re
import io
import mimetypes
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

# --- CONFIGURATION ---
CSV_FILE_PATH = './src/lib/assets/content-list/NIMI_CONTENT.csv'
OUTPUT_FOLDER = './src/lib/assets/content-list/thumbnails'
LINK_COLUMN_INDEX = 2
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

def get_drive_service():
    """Shows basic usage of the Drive v3 API.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('.google/token.json'):
        creds = Credentials.from_authorized_user_file('.google/token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                '.google/credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('.google/token.json', 'w') as token:
            token.write(creds.to_json())

    return build('drive', 'v3', credentials=creds)

def extract_file_id(url):
    """Extracts the Google Drive file ID from a URL."""
    # Matches patterns like /file/d/ID/view or id=ID
    patterns = [
        r'/file/d/([a-zA-Z0-9_-]+)',
        r'id=([a-zA-Z0-9_-]+)'
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def download_file(service, file_id, output_path):
    """Downloads a file from Google Drive."""
    try:
        # Get file metadata to determine extension (mimeType)
        file_metadata = service.files().get(fileId=file_id, fields='mimeType').execute()
        mime_type = file_metadata.get('mimeType')

        # Guess extension based on mime type
        extension = mimetypes.guess_extension(mime_type)
        if not extension:
            # Fallback for common types if guess fails
            if mime_type == 'image/jpeg': extension = '.jpg'
            elif mime_type == 'image/png': extension = '.png'
            elif mime_type == 'image/webp': extension = '.webp'
            else: extension = '.bin'

        # Construct full filename: ID + Extension
        filename = f"{file_id}{extension}"
        full_path = os.path.join(output_path, filename)

        if os.path.exists(full_path):
            print(f"Skipping {filename} (already exists)")
            return

        request = service.files().get_media(fileId=file_id)
        fh = io.FileIO(full_path, mode='wb')
        downloader = MediaIoBaseDownload(fh, request)

        done = False
        print(f"Downloading {filename}...", end='', flush=True)
        while done is False:
            status, done = downloader.next_chunk()
        print(" Done.")

    except Exception as e:
        print(f"\nError downloading {file_id}: {str(e)}")

def main():
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    service = get_drive_service()

    with open(CSV_FILE_PATH, mode='r', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)

        # Skip header if your CSV has one.
        # Comment this out if your CSV has no header.
        next(reader, None)

        for row_idx, row in enumerate(reader):
            if len(row) <= LINK_COLUMN_INDEX:
                continue

            drive_link = row[LINK_COLUMN_INDEX].strip()

            # Skip empty links
            if not drive_link:
                continue

            file_id = extract_file_id(drive_link)

            if file_id:
                download_file(service, file_id, OUTPUT_FOLDER)
            else:
                print(f"Could not extract ID from row {row_idx + 2}: {drive_link}")

if __name__ == '__main__':
    main()
