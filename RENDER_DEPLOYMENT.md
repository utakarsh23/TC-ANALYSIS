# Deploying to Render with Code Execution

## ✅ Your Setup is Perfect for Render

Your backend already has everything Render needs:
- Java compiler (openjdk17)
- C++ compiler (g++)
- Python 3
- All installed in the Docker container

## 🚀 Deploy Steps on Render

### 1. Create Render Web Service

1. Go to [render.com](https://render.com) → Dashboard
2. Click **Create** → **Web Service**
3. Connect GitHub repo

### 2. Configure Service

**Basic Info:**
- Name: `dsa-runtime-backend`
- Runtime: `Docker`
- Region: Choose closest to you

**Build & Start:**
- **Dockerfile Path**: `./Backend/Dockerfile.server`
- **Build Command**: (leave empty - Dockerfile handles it)
- **Start Command**: (leave empty - Dockerfile has CMD)

### 3. Environment Variables

Add these in Render dashboard:
```
NODE_ENV=production
PORT=9092
USE_DOCKER=false
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

### 4. Resource Settings

**⚠️ Important for Code Execution:**
- Instance Type: **Standard** (0.5 GB RAM - minimum)
- **If code execution is slow/fails**: Upgrade to **Plus** (2 GB RAM)
- Auto-deploy: Yes

### 5. Deploy

Click **Deploy** and wait 5-10 minutes for:
1. Docker image build
2. Compiler installation
3. Node modules installation
4. Server startup

## 📊 What Happens During Build

```
1. Ubuntu 22.04 base image
2. Install g++, openjdk17, python3
3. Install Node dependencies  
4. Copy your code
5. Start on port 9092
```

## ⏱️ Performance Notes

| Operation | Time |
|-----------|------|
| Build image | 3-5 min |
| Install compilers | 2-3 min |
| Cold start | 10-15 sec |
| Java compile | 2-3 sec |
| C++ compile | 1-2 sec |
| Python interpret | <1 sec |

## ⚠️ Limitations on Render

| Limit | Impact | Solution |
|-------|--------|----------|
| 30s timeout | Large inputs may fail | Use <100K size |
| 0.5GB RAM | Tight memory | Test before scaling |
| Cold start | Slow first request | Upgrade to paid tier |
| 750 hrs/month | Free tier limit | Monitor usage |

## 🧪 Test on Render

### 1. Health Check
```bash
curl https://your-backend.onrender.com/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Test Code Execution
```bash
curl -X POST https://your-backend.onrender.com/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "code": "static void solve(int[] arr) { System.out.println(\"Hello\"); }",
    "lang": "java",
    "tags": [],
    "inputType": "int[]",
    "customTestCases": ["3\n1 2 3"]
  }'
```

### 3. Try in Frontend
Open Vercel frontend → Add custom test case → Run code

## 🔧 Troubleshooting

### Issue: "Compilation failed" or "Command not found"

**Causes:**
- Compilers not installed
- Wrong working directory
- Insufficient permissions

**Solution:**
1. Check Render build logs
2. Verify Dockerfile.server is in Backend folder
3. Manually rebuild from Render dashboard

### Issue: Timeout on Execution

**Causes:**
- Input size too large (1M elements)
- Slow algorithm on Render hardware
- Memory swap causing slowdown

**Solution:**
- Test with 100K elements instead of 1M
- Upgrade to Standard instance
- Optimize code execution

### Issue: Memory Error During Compilation

**Cause:** Free tier (0.5GB) too small for compilation

**Solution:**
- Upgrade to Plus tier (2GB)
- Or optimize code size
- Compile on larger instance

## 📈 Scaling Tips

**If it works but slow:**
1. Upgrade to Standard instance ($7/mo)
2. Or use Railway/Fly.io (better for CPU workloads)

**If traffic is high:**
1. Add a second instance
2. Render auto-scales
3. Monitor Render dashboard

## 🎯 Full Deploy Checklist

- [ ] Dockerfile.server is in Backend/ folder
- [ ] .env.example updated
- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web Service created (Docker)
- [ ] Environment variables added
- [ ] Instance type is Standard (0.5GB)
- [ ] Deploy initiated
- [ ] Wait for build (5-10 min)
- [ ] Test health endpoint
- [ ] Test code submission
- [ ] Update CORS_ORIGIN after frontend deployed

## 💰 Cost Breakdown

| Service | Price | Notes |
|---------|-------|-------|
| Render Backend | Free tier | 750 hrs/month |
| | $7/mo | Standard instance |
| Vercel Frontend | Free | Unlimited |
| Total | Free-$7/mo | Perfect for hobby projects |

## ✅ Advantages of This Setup

1. ✓ Java/C++/Python all pre-installed
2. ✓ Single container = simple deployment
3. ✓ No Docker-in-Docker complexity
4. ✓ Fast local code execution (no network overhead)
5. ✓ Easy to scale - just upgrade instance
6. ✓ Works on free tier

You're all set for production! 🚀
