#!/usr/bin/env python3
"""
X-ray Classification Tools for LUNGSCAREAI
Integrates chest X-ray analysis with RAG system
"""

import os
import json
import numpy as np
import tensorflow as tf
from langchain.tools import BaseTool
from typing import Dict, Any
from PIL import Image
import cv2

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Custom Coordinate Attention Layer (required for model loading)
class CoordinateAttention(tf.keras.layers.Layer):
    def __init__(self, reduction=32, **kwargs):
        super(CoordinateAttention, self).__init__(**kwargs)
        self.reduction = reduction

    def build(self, input_shape):
        _, H, W, C = input_shape
        self.C = C
        self.conv1 = tf.keras.layers.Conv2D(max(8, C // self.reduction), 1, padding="same", use_bias=False)
        self.bn1 = tf.keras.layers.BatchNormalization()
        self.act = tf.keras.layers.Activation("relu")
        self.conv_h = tf.keras.layers.Conv2D(C, 1, padding="same", use_bias=False)
        self.conv_w = tf.keras.layers.Conv2D(C, 1, padding="same", use_bias=False)

    def call(self, x):
        h_pool = tf.reduce_mean(x, axis=1, keepdims=True)
        w_pool = tf.reduce_mean(x, axis=2, keepdims=True)
        w_pool_t = tf.transpose(w_pool, [0, 2, 1, 3])
        concat = tf.concat([h_pool, w_pool_t], axis=1)

        out = self.conv1(concat)
        out = self.bn1(out)
        out = self.act(out)

        h_out, w_out = tf.split(out, num_or_size_splits=2, axis=1)
        w_out = tf.transpose(w_out, [0, 2, 1, 3])

        h_att = tf.nn.sigmoid(self.conv_h(h_out))
        w_att = tf.nn.sigmoid(self.conv_w(w_out))

        return x * h_att * w_att

    def get_config(self):
        config = super().get_config()
        config.update({"reduction": self.reduction})
        return config

# ------------------------------
# Preprocessing Functions (CLAHE + GFB)
# ------------------------------
def load_imagej_gfb_lut():
    """Load Green Fire Blue LUT from project directory"""
    # Use relative path from project root
    current_dir = os.path.dirname(os.path.abspath(__file__))
    lut_path = os.path.join(current_dir, "Green Fire Blue (1).lut")

    if not os.path.exists(lut_path):
        print(f"❌ GFB LUT file not found at: {lut_path}")
        return None
    
    try:
        with open(lut_path, 'rb') as f:
            lut_data = f.read()
        
        # Read RGB values from the LUT file
        reds = np.frombuffer(lut_data[:256], dtype=np.uint8)
        greens = np.frombuffer(lut_data[256:512], dtype=np.uint8) 
        blues = np.frombuffer(lut_data[512:768], dtype=np.uint8)
        
        # Stack as RGB for matplotlib/PIL display
        gfb_lut = np.stack((reds, greens, blues), axis=1)
        print("✅ GFB LUT loaded successfully")
        return gfb_lut
    except Exception as e:
        print(f"❌ Error loading GFB LUT: {e}")
        return None

def apply_CLAHE(img):
    """Apply Contrast Limited Adaptive Histogram Equalization"""
    if len(img.shape) == 3:
        lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        return cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)
    else:
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        return clahe.apply(img)

def apply_GFB(img, gfb_lut):
    """Apply Green Fire Blue colormap"""
    gray = img if img.ndim == 2 else cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    img_norm = cv2.normalize(gray, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    flat_idx = img_norm.flatten()
    colored = gfb_lut[flat_idx]
    return colored.reshape((*img_norm.shape, 3))

def preprocess_xray_image(img_path, target_size=(224, 224), enhance=True):
    """Enhanced preprocessing pipeline with CLAHE + GFB"""
    try:
        # Load original image
        orig_img = Image.open(img_path).convert('RGB')
        img_array = np.array(orig_img)
        
        if enhance:
            # Apply CLAHE enhancement
            enhanced_img = apply_CLAHE(img_array)
            
            # Apply GFB colormap for better visualization
            gfb_lut = load_imagej_gfb_lut()
            colored_img = apply_GFB(enhanced_img, gfb_lut)
            preprocessed_img = Image.fromarray(colored_img.astype(np.uint8))
        else:
            preprocessed_img = orig_img
        
        # Resize for model input
        model_input = preprocessed_img.resize(target_size)
        x = np.array(model_input) / 255.0
        x = np.expand_dims(x, axis=0)
        
        return orig_img, preprocessed_img, x
        
    except Exception as e:
        raise ValueError(f"Failed to preprocess X-ray image {img_path}: {e}")

# Global model cache for X-ray models
_XRAY_MODEL_CACHE = {
    'model': None,
    'class_indices': None,
    'loaded': False
}

def get_cached_xray_model():
    """Get cached X-ray model components to avoid reloading"""
    global _XRAY_MODEL_CACHE
    
    if not _XRAY_MODEL_CACHE['loaded']:
        print("🚀 Loading X-ray classification model...")
        
        try:
            # Get the absolute path to the model file
            import os
            current_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(current_dir, "final_model.keras")
            indices_path = os.path.join(current_dir, "inv_class_indices.json")
            
            # Load the model with custom objects
            _XRAY_MODEL_CACHE['model'] = tf.keras.models.load_model(
                model_path,
                custom_objects={"CoordinateAttention": CoordinateAttention},
                compile=False
            )
            
            # Load class indices
            with open(indices_path, "r") as f:
                inv_class_indices = json.load(f)
            _XRAY_MODEL_CACHE['class_indices'] = {int(k): v for k, v in inv_class_indices.items()}
            
            print("✅ X-ray model loaded successfully")
            _XRAY_MODEL_CACHE['loaded'] = True
            
        except Exception as e:
            print(f"❌ Failed to load X-ray model: {e}")
            raise
    
    return _XRAY_MODEL_CACHE['model'], _XRAY_MODEL_CACHE['class_indices']

class XrayClassificationTool(BaseTool):
    name: str = "xray_classification"
    description: str = "Classifies chest X-ray images for various lung diseases/conditions with confidence percentage using enhanced CLAHE preprocessing. Input: path to X-ray image file"
    model: Any = None
    class_indices: Dict = None
    
    def __init__(self):
        super().__init__()
        # Use cached model for faster initialization
        self.model, self.class_indices = get_cached_xray_model()
    
    def _run(self, path: str) -> str:
        try:
            # Convert to absolute path if not already
            if not os.path.isabs(path):
                path = os.path.abspath(path)
            
            # Check if file exists
            if not os.path.exists(path):
                raise FileNotFoundError(f"X-ray image not found: {path}")
            
            # Enhanced preprocessing with CLAHE + GFB
            orig_img, preprocessed_img, x = preprocess_xray_image(path, enhance=True)
            
            # Run prediction
            pred = self.model.predict(x, verbose=0)
            pred_class = np.argmax(pred, axis=1)[0]
            pred_label = self.class_indices[pred_class]
            confidence = float(pred[0][pred_class]) * 100
            
            # Get top 5 predictions for additional context
            top_5_indices = pred[0].argsort()[-5:][::-1]
            top_5_predictions = []
            for idx in top_5_indices:
                top_5_predictions.append({
                    "label": self.class_indices[idx],
                    "confidence": float(pred[0][idx]) * 100
                })
            
            return json.dumps({
                "label": pred_label,
                "confidence": round(confidence, 2),
                "classification_type": "chest_xray",
                "preprocessing": "CLAHE + GFB Enhanced",
                "top_5_predictions": top_5_predictions,
                "image_path": path,
                "enhancement_applied": True
            })
            
        except Exception as e:
            return f"Error processing X-ray image: {str(e)}"

class XrayVisualizationTool(BaseTool):
    name: str = "xray_visualization"
    description: str = "Classifies chest X-ray with enhanced CLAHE preprocessing and generates comprehensive visualization with original, preprocessed images and prediction analysis. Input: path to X-ray image file"
    model: Any = None
    class_indices: Dict = None
    
    def __init__(self):
        super().__init__()
        self.model, self.class_indices = get_cached_xray_model()
    
    def _run(self, path: str) -> str:
        try:
            import matplotlib.pyplot as plt
            
            # Convert to absolute path if not already
            if not os.path.isabs(path):
                path = os.path.abspath(path)
            
            # Check if file exists
            if not os.path.exists(path):
                raise FileNotFoundError(f"X-ray image not found: {path}")
            
            # Enhanced preprocessing with CLAHE + GFB
            orig_img, preprocessed_img, x = preprocess_xray_image(path, enhance=True)
            
            # Run prediction
            pred = self.model.predict(x, verbose=0)
            pred_class = np.argmax(pred, axis=1)[0]
            pred_label = self.class_indices[pred_class]
            confidence = float(pred[0][pred_class]) * 100
            
            # Get top predictions for visualization
            top_k = min(10, len(self.class_indices))
            top_indices = pred[0].argsort()[-top_k:][::-1]
            top_labels = [self.class_indices[i] for i in top_indices]
            top_scores = [pred[0][i] for i in top_indices]
            
            # Create output directory
            os.makedirs("outputs", exist_ok=True)
            
            # Generate enhanced visualization
            filename = os.path.basename(path).replace('.jpg', '').replace('.png', '').replace('.jpeg', '')
            output_path = f"outputs/{filename}_xray_analysis.png"
            
            plt.figure(figsize=(20, 6))
            
            # Show original X-ray image
            plt.subplot(1, 4, 1)
            plt.imshow(orig_img)
            plt.axis("off")
            plt.title("Original X-ray", fontsize=12, fontweight="bold")
            
            # Show CLAHE enhanced image
            plt.subplot(1, 4, 2)
            plt.imshow(preprocessed_img)
            plt.axis("off")
            plt.title("CLAHE Enhanced", fontsize=12, fontweight="bold")
            
            # Show the actual preprocessed image that was fed to the model (with GFB)
            plt.subplot(1, 4, 3)
            # Convert the model input back to displayable format
            model_input_display = (x[0] * 255).astype(np.uint8)  # Denormalize
            plt.imshow(model_input_display)
            plt.axis("off")
            plt.title("Model Input\n(CLAHE + GFB, 224x224)", fontsize=12, fontweight="bold")
            
            # Show prediction bar chart
            plt.subplot(1, 4, 4)
            # Color coding: red for high confidence (>50%), orange for medium (>25%), blue for low
            colors = []
            for score in top_scores:
                if score > 0.5:
                    colors.append('red')
                elif score > 0.25:
                    colors.append('orange')
                else:
                    colors.append('skyblue')
            
            plt.barh(range(len(top_labels)), top_scores, color=colors)
            plt.yticks(range(len(top_labels)), [label.replace('_', ' ') for label in top_labels])
            plt.xlabel("Probability")
            plt.title(f"Prediction: {pred_label}\nConfidence: {confidence:.1f}%", 
                     fontsize=12, fontweight="bold")
            plt.xlim(0, 1)
            
            # Add percentage labels on bars
            for i, score in enumerate(top_scores):
                plt.text(score + 0.01, i, f'{score*100:.1f}%', 
                        va='center', fontsize=9)
            
            plt.tight_layout()
            plt.savefig(output_path, dpi=200, bbox_inches='tight')
            plt.close()
            
            return json.dumps({
                "label": pred_label,
                "confidence": round(confidence, 2),
                "classification_type": "chest_xray",
                "preprocessing": "CLAHE + GFB Enhanced",
                "visualization_saved": output_path,
                "enhancement_applied": True,
                "top_predictions": list(zip([self.class_indices[i] for i in top_indices[:5]], 
                                          [float(pred[0][i]) * 100 for i in top_indices[:5]])),
                "explanation": f"Enhanced X-ray analysis completed for {pred_label} prediction. Visualization saved to {output_path} shows original image, CLAHE+GFB enhanced image, and top disease classifications with confidence scores. The preprocessing improved image contrast and visibility for better analysis."
            })
            
        except Exception as e:
            return f"Error processing X-ray with enhanced visualization: {str(e)}"
