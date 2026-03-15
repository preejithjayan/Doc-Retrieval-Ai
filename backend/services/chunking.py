import re



def normalize_text(text):
    cleaned = text.replace('\x00', ' ')
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned.strip()



def chunk_text(text, chunk_size=700, overlap=120):
    words = normalize_text(text).split()
    if not words:
        return []

    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = ' '.join(words[start:end]).strip()
        if chunk:
            chunks.append(chunk)
        if end == len(words):
            break
        start = max(end - overlap, start + 1)
    return chunks
