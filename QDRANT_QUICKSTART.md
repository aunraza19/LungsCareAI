# 🚀 Quick Reference: Qdrant Setup for LungsCareAI

## TL;DR - Get Started in 3 Steps

### Step 1: Install Docker Desktop
Download and install from: https://www.docker.com/products/docker-desktop/

### Step 2: Start Qdrant
Open PowerShell in your project directory and run:
```powershell
.\start_qdrant.ps1
```

### Step 3: Verify
Visit http://localhost:6333/dashboard in your browser

---

## Common Commands

### Start Qdrant
```powershell
.\start_qdrant.ps1
```
Or manually:
```powershell
docker start qdrant
```

### Stop Qdrant
```powershell
.\stop_qdrant.ps1
```
Or manually:
```powershell
docker stop qdrant
```

### Check Status
```powershell
docker ps
```

### View Logs
```powershell
docker logs qdrant
```

### Access Dashboard
Open in browser: http://localhost:6333/dashboard

---

## Troubleshooting

### Problem: "Docker is not running"
**Solution:** Start Docker Desktop from Start Menu, wait for it to fully start

### Problem: Port 6333 already in use
**Solution:** 
```powershell
docker stop qdrant
docker start qdrant
```

### Problem: Cannot connect from Python
**Solution:**
1. Check Qdrant is running: `docker ps`
2. Visit http://localhost:6333/dashboard
3. Install qdrant-client: `pip install qdrant-client`

---

## Data Location
Your medical knowledge base is stored in: `./qdrant_data/`

This folder contains all vector embeddings and will persist even if you restart Docker.

---

## Need More Help?
See the full guide: [QDRANT_SETUP.md](QDRANT_SETUP.md)

