# Model Files Guide

## 📦 Large Model Files

Due to GitHub's 100MB file size limit, the following model files are **NOT** included in this repository:

1. **Audio Model**: `final_model_ast (1).pt` (~350MB)
   - Fine-tuned Audio Spectrogram Transformer
   - Binary classification: Normal vs Abnormal

2. **X-ray Model**: `final_model.keras` (~100MB)
   - Custom CNN with Coordinate Attention
   - 10-class lung disease classification

---

## 📥 Download Models

**Audio Model (final_model_ast (1).pt):**
- **Download**: [Google Drive Link](https://drive.google.com/file/d/1dKlyhn7TRilJFaD5QkCjBPTNLLCoJkqv/view?usp=sharing)
- **Size**: ~350MB
- **Using gdown**:
  ```bash
  pip install gdown
  gdown --id 1dKlyhn7TRilJFaD5QkCjBPTNLLCoJkqv -O "final_model_ast (1).pt"
  ```

**X-ray Model (final_model.keras):**
- **Download**: [Google Drive Link](https://drive.google.com/file/d/1Tvfz5_Aa-VJXJo-XgcTSCGmk9mVcxWGY/view?usp=sharing)
- **Size**: ~100MB
- **Using gdown**:
  ```bash
  pip install gdown
  gdown --id 1Tvfz5_Aa-VJXJo-XgcTSCGmk9mVcxWGY -O "final_model.keras"
  ```

**After downloading, place both files in the project root directory.**

---

## ✅ Verify Downloaded Models

After downloading, verify the files are in the project root:

```bash
# Windows
dir "final_model_ast (1).pt" final_model.keras

# Linux/Mac
ls -lh "final_model_ast (1).pt" final_model.keras
```

---

## 🔧 Model File Structure

```
LungsCareAI/
├── final_model_ast (1).pt      # Audio model (download separately)
├── final_model.keras            # X-ray model (download separately)
├── inv_class_indices.json       # X-ray class mapping (included)
├── Green Fire Blue (1).lut      # X-ray colormap (included)
├── inf.py                       # Audio analysis code
└── xray_tools.py                # X-ray analysis code
```

---

## 🧪 Test Models

After downloading, test the models:

```python
# Test audio model
python -c "import torch; model = torch.load('final_model_ast (1).pt', map_location='cpu'); print('✅ Audio model loaded')"

# Test X-ray model
python -c "import tensorflow as tf; model = tf.keras.models.load_model('final_model.keras', compile=False); print('✅ X-ray model loaded')"
```

---

## 📝 Model Information

### Audio Model (AST)
- **Architecture**: Audio Spectrogram Transformer
- **Base Model**: MIT/ast-finetuned-audioset-10-10-0.4593
- **Fine-tuned**: Binary lung sound classification
- **Input**: 10-second audio clips @ 16kHz
- **Output**: Normal (0) or Abnormal (1)
- **Framework**: PyTorch

### X-ray Model (CNN)
- **Architecture**: Custom CNN with Coordinate Attention
- **Input**: 224×224 RGB images (CLAHE+GFB enhanced)
- **Output**: 10 disease classes
- **Classes**:
  0. Control (Normal)
  1. COVID-19
  2. Pleural Effusion
  3. Lung Opacity
  4. Mass
  5. Nodule
  6. Pneumonia
  7. Pneumothorax
  8. Pulmonary Fibrosis
  9. Tuberculosis
- **Framework**: TensorFlow/Keras

---

## 🔄 Updating Models

To use updated model versions:

1. Download new model files
2. Replace old files in project root
3. Restart backend server
4. Clear cached models (if applicable)

---

## ⚠️ Important Notes

1. **Do NOT commit** model files directly to Git (they're in .gitignore)
2. **Keep models secure** - they contain trained weights
3. **Backup models** - store in multiple locations
4. **Version models** - track model versions separately
5. **Document changes** - note model updates in CHANGELOG

---

## 🆘 Troubleshooting

**Error: Model file not found**
- Ensure files are in project root directory
- Check file names match exactly (including spaces and parentheses)
- Verify download completed successfully

**Error: Out of memory**
- Models are loaded on demand
- Close other applications
- Use CPU mode (automatic fallback)

**Error: Model loading failed**
- Check Python dependencies are installed
- Verify file integrity (not corrupted)
- Try re-downloading models

---

## 📞 Support

For model-related issues:
- Check [Issues](https://github.com/aunraza19/LungsCareAI/issues)
- Create new issue with error details
- Contact maintainers

---

**Last Updated**: December 2025

