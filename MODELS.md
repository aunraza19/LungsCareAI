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

## 📥 Download Options

### Option 1: Google Drive (Recommended)

**Audio Model:**
```bash
# Download link: [INSERT YOUR GOOGLE DRIVE LINK]
# Or use gdown:
pip install gdown
gdown --id YOUR_FILE_ID -O "final_model_ast (1).pt"
```

**X-ray Model:**
```bash
# Download link: [INSERT YOUR GOOGLE DRIVE LINK]
# Or use gdown:
gdown --id YOUR_FILE_ID -O "final_model.keras"
```

### Option 2: Git LFS (Alternative)

If you prefer using Git LFS to store models in the repository:

```bash
# Install Git LFS
git lfs install

# Track model files
git lfs track "*.pt"
git lfs track "*.keras"

# Add and commit
git add .gitattributes
git add "final_model_ast (1).pt" final_model.keras
git commit -m "Add model files with Git LFS"
git push
```

**Note:** Git LFS has storage limits on free plans.

### Option 3: Hugging Face Hub

Upload models to Hugging Face:

```python
# Upload script
from huggingface_hub import HfApi

api = HfApi()
api.upload_file(
    path_or_fileobj="final_model_ast (1).pt",
    path_in_repo="final_model_ast (1).pt",
    repo_id="your-username/lungscareai-models",
    repo_type="model",
)
```

Download:
```python
from huggingface_hub import hf_hub_download

hf_hub_download(
    repo_id="your-username/lungscareai-models",
    filename="final_model_ast (1).pt",
    local_dir="."
)
```

### Option 4: Release Assets

Upload as GitHub Release assets:

1. Go to GitHub repository
2. Click "Releases" > "Create a new release"
3. Upload model files as assets
4. Users download from release page

---

## ✅ Verify Downloaded Models

After downloading, verify the files:

```bash
# Check files exist
ls -lh "final_model_ast (1).pt" final_model.keras

# Expected sizes (approximate):
# final_model_ast (1).pt: ~350MB
# final_model.keras: ~100MB
```

Place both files in the **project root directory** (same level as README.md).

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

