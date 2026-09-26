import os
import time
import json
import re
import base64
import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from backend.models.user import User
from backend.security import get_current_user

logger = logging.getLogger("krivio.routes.images")

router = APIRouter(prefix="/api/images", tags=["images"])

@router.post("/analyze")
def analyze_product_image(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Analyzes an uploaded product image using Gemini Vision for lighting, background, and marketplace appeal.
    """
    image_base64 = payload.get("imageBase64", "")
    if not image_base64:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="imageBase64 is required.")

    clean_base64 = re.sub(r"^data:image/\w+;base64,", "", image_base64)
    gemini_key = os.getenv("GEMINI_API_KEY")

    if not gemini_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI vision service unconfigured. GEMINI_API_KEY is missing on backend."
        )

    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=gemini_key)
        
        # Decode base64 to binary bytes for Gemini
        image_bytes = base64.b64decode(clean_base64)
        
        prompt = """Act as an e-commerce product photography advisor for rural Indian artisans. Analyze this product photo for selling online on Amazon Karigar, ONDC, Meesho, and Etsy.
Evaluate:
1. Lighting quality (0-100)
2. Background clarity (0-100)
3. Overall appeal (0-100)
4. Detected item name

Return JSON with:
"lightingScore": number,
"backgroundScore": number,
"overallScore": number,
"lightingFeedback": string,
"backgroundFeedback": string,
"suggestions": string array with 3 actionable tips,
"detectedSubject": string"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                prompt
            ],
            config={"response_mime_type": "application/json"}
        )
        analysis_data = json.loads(response.text)
        analysis_data["id"] = f"img_{int(time.time())}"
        analysis_data["imageUrl"] = image_base64
        analysis_data["createdAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        return {"analysis": analysis_data}
    except Exception as e:
        logger.error(f"Gemini image analysis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI image analysis service temporarily unavailable: {str(e)}"
        )

