import os
from uuid import uuid4


ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.tiff', '.bmp'}



def document_upload_path(instance, filename):
    extension = os.path.splitext(filename)[1].lower()
    safe_name = f"{uuid4().hex}{extension}"
    return os.path.join('documents', str(instance.uploaded_by_id), safe_name)
