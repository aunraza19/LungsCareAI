# Qdrant Docker Setup Guide for LungsCareAI

This guide will help you install and run Qdrant vector database using Docker on Windows.

## Prerequisites

1. **Docker Desktop for Windows** must be installed
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and restart your computer if prompted
   - Make sure Docker Desktop is running (check system tray)

## Quick Start - Run Qdrant

### Option 1: Using Docker Command (Recommended)

Open PowerShell and run:

```powershell
docker run -d -p 6333:6333 -p 6334:6334 -v ${PWD}/qdrant_storage:/qdrant/storage:z --name qdrant qdrant/qdrant
```

**What this does:**
- `-d`: Runs container in detached mode (background)
- `-p 6333:6333`: Exposes REST API port (used by your application)
- `-p 6334:6334`: Exposes gRPC port (optional, for advanced usage)
- `-v ${PWD}/qdrant_storage:/qdrant/storage:z`: Creates persistent storage in your current directory
- `--name qdrant`: Names the container "qdrant" for easy management
- `qdrant/qdrant`: Official Qdrant Docker image

### Option 2: Using Docker Compose (For persistent setup)

1. A `docker-compose.yml` file has been created in your project root
2. Open PowerShell in your project directory and run:

```powershell
docker-compose up -d
```

## Verify Qdrant is Running

1. Check if container is running:
```powershell
docker ps
```

You should see a container named "qdrant" in the list.

2. Open your browser and visit:
   - REST API: http://localhost:6333/dashboard
   - Health check: http://localhost:6333/

You should see the Qdrant web interface.

## Managing Qdrant Container

### Stop Qdrant
```powershell
docker stop qdrant
```

### Start Qdrant (after stopping)
```powershell
docker start qdrant
```

### Restart Qdrant
```powershell
docker restart qdrant
```

### View Qdrant Logs
```powershell
docker logs qdrant
```

### View Real-time Logs
```powershell
docker logs -f qdrant
```

### Remove Qdrant Container (data will persist if you used volume)
```powershell
docker rm -f qdrant
```

## Troubleshooting

### Port Already in Use
If you get a port conflict error, check what's using the port:
```powershell
netstat -ano | findstr :6333
```

Kill the process or use a different port:
```powershell
docker run -d -p 6335:6333 -p 6336:6334 -v ${PWD}/qdrant_storage:/qdrant/storage:z --name qdrant qdrant/qdrant
```

Then update `rag.py` to use `http://localhost:6335`

### Docker Desktop Not Running
Make sure Docker Desktop is running. Check the system tray for the Docker icon.

### Cannot Connect from Python
1. Verify Qdrant is running: `docker ps`
2. Check Qdrant logs: `docker logs qdrant`
3. Test connection: Visit http://localhost:6333/dashboard in your browser
4. Verify Python has `qdrant-client` installed: `pip install qdrant-client`

### Data Persistence
Your Qdrant data is stored in:
- Using Docker command: `./qdrant_storage` folder in your current directory
- Using Docker Compose: `./qdrant_data` folder in your project root

This ensures your medical knowledge base persists even if you restart the container.

## Running Your LungsCareAI Application

Once Qdrant is running:

1. Install Python dependencies:
```powershell
pip install qdrant-client langchain-community
```

2. Make sure your `.env` file has the GEMINI_API_KEY set

3. Run your application:
```powershell
# For backend
cd backend
python app.py
```

The application will automatically:
- Connect to Qdrant at http://localhost:6333
- Create the "medical_meadow" collection if it doesn't exist
- Load the medical knowledge base from `medical_meadow_wikidoc_patient_info_cleaned.json`

## Qdrant Collection Information

Your application uses:
- **Collection Name**: `medical_meadow`
- **Embedding Model**: `all-MiniLM-L6-v2` (384 dimensions)
- **Distance Metric**: Cosine similarity
- **HNSW Indexing**: Enabled for fast similarity search

## Additional Resources

- Qdrant Documentation: https://qdrant.tech/documentation/
- Docker Documentation: https://docs.docker.com/
- Qdrant Dashboard: http://localhost:6333/dashboard (after starting)

