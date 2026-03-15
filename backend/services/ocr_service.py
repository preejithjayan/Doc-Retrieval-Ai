from dataclasses import dataclass
from pathlib import Path

from services.chunking import normalize_text


@dataclass
class OCRExtraction:
    text: str
    confidence: float
    structured_output: dict


class OCRService:
    def _preprocess_image(self, image_path):
        import cv2

        image = cv2.imread(str(image_path))
        if image is None:
            raise ValueError(f'Unable to read image: {image_path}')
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
        _, thresholded = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return thresholded

    def extract_from_image(self, image_path):
        from paddleocr import PaddleOCR
        import cv2

        image_path = Path(image_path)
        processed = self._preprocess_image(image_path)
        temp_path = image_path.with_name(f'{image_path.stem}_processed.png')
        cv2.imwrite(str(temp_path), processed)
        try:
            engine = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
            result = engine.ocr(str(temp_path), cls=True)
        finally:
            if temp_path.exists():
                temp_path.unlink()

        lines = []
        confidence_scores = []
        structured_blocks = []
        for page in result or []:
            for item in page or []:
                polygon, prediction = item
                text, confidence = prediction[0], float(prediction[1])
                if text.strip():
                    lines.append(text.strip())
                    confidence_scores.append(confidence)
                    structured_blocks.append({'polygon': polygon, 'text': text.strip(), 'confidence': confidence})

        text = normalize_text(' '.join(lines))
        avg_confidence = round(sum(confidence_scores) / len(confidence_scores), 4) if confidence_scores else 0.0
        return OCRExtraction(
            text=text,
            confidence=avg_confidence,
            structured_output={'blocks': structured_blocks, 'source': str(image_path)},
        )
