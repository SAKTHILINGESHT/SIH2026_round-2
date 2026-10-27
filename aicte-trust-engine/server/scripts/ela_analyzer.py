#!/usr/bin/env python3
"""
Forensic Error Level Analysis (ELA) & Tampering Detection Engine
Multi-Modal Trust Engine (SIH26261)
Analyzes image compression artifacts, detects spliced text/dates, and flags bounding boxes.
"""

import sys
import json
import os
import io
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
import cv2

def analyze_ela(image_path, output_ela_path=None, quality=90, scale=15):
    """
    Performs Error Level Analysis on the given image path.
    Returns metadata, anomaly score, and detected anomaly bounding boxes.
    """
    if not os.path.exists(image_path):
        return {"error": f"File not found: {image_path}"}
    
    try:
        orig = Image.open(image_path).convert('RGB')
        w, h = orig.size
        
        # 1. Resave to memory buffer with target JPEG quality
        buffer = io.BytesIO()
        orig.save(buffer, 'JPEG', quality=quality)
        buffer.seek(0)
        resaved = Image.open(buffer)
        
        # 2. Compute absolute difference (compression error)
        diff = ImageChops.difference(orig, resaved)
        
        # 3. Enhance difference for visualization
        extrema = diff.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        if max_diff == 0:
            max_diff = 1
        scale_factor = 255.0 / max_diff
        enhanced_diff = ImageEnhance.Brightness(diff).enhance(scale_factor)
        
        # Save ELA visualization if requested
        if output_ela_path:
            os.makedirs(os.path.dirname(os.path.abspath(output_ela_path)), exist_ok=True)
            # Create false-color thermal heatmap using OpenCV
            diff_np = np.array(enhanced_diff)
            gray_diff = cv2.cvtColor(diff_np, cv2.COLOR_RGB2GRAY)
            heatmap = cv2.applyColorMap(gray_diff, cv2.COLORMAP_JET)
            cv2.imwrite(output_ela_path, heatmap)

        # 4. Anomaly contour detection for suspicious spliced regions
        diff_np = np.array(diff)
        gray = cv2.cvtColor(diff_np, cv2.COLOR_RGB2GRAY)
        
        # Calculate mean error and standard deviation
        mean_err = float(np.mean(gray))
        std_err = float(np.std(gray))
        
        # Threshold pixels that deviate strongly from baseline
        thresh_val = mean_err + 2.5 * std_err
        _, thresh = cv2.threshold(gray, max(thresh_val, 12), 255, cv2.THRESH_BINARY)
        
        # Morphological dilation to group adjacent pixel spikes
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 10))
        dilated = cv2.dilate(thresh, kernel, iterations=2)
        
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        detected_boxes = []
        for c in contours:
            area = cv2.contourArea(c)
            # Filter reasonable text/date bounding box sizes
            if 300 < area < (w * h * 0.4):
                bx, by, bw, bh = cv2.boundingRect(c)
                detected_boxes.append({
                    "box": [int(bx), int(by), int(bw), int(bh)],
                    "area": int(area),
                    "confidence": round(min(0.98, 0.65 + (area / 10000.0)), 2),
                    "message": "Elevated compression variance detected (potential font/date splicing)"
                })
        
        # Sort by area descending
        detected_boxes = sorted(detected_boxes, key=lambda x: x["area"], reverse=True)[:5]
        
        anomaly_detected = len(detected_boxes) > 0 or max_diff > 35
        tamper_score = round(min(1.0, (mean_err * 2.0 + len(detected_boxes) * 0.25) / 10.0), 3)

        return {
            "success": True,
            "imageDimensions": {"width": w, "height": h},
            "meanErrorLevel": round(mean_err, 2),
            "maxDiff": int(max_diff),
            "tamperScore": tamper_score,
            "anomalyDetected": anomaly_detected,
            "flaggedBoxes": detected_boxes,
            "elaOutputPath": output_ela_path if output_ela_path else None
        }

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python ela_analyzer.py <input_image_path> [output_ela_path]"}))
        sys.exit(1)
        
    in_path = sys.argv[1]
    out_path = sys.argv[2] if len(sys.argv) > 2 else None
    result = analyze_ela(in_path, out_path)
    print(json.dumps(result))
