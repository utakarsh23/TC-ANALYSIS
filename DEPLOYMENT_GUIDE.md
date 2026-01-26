# DSA Runtime Analysis System - Deployment Guide

## Project Architecture
```
GraphWithProg/
├── Backend (Node.js + Express)
│   ├── Services (Code Execution: Java, C++, Python)
│   ├── Controllers (API endpoints)
│   └── Routes (REST API)
├── Frontend (Next.js 14 + React 19 + TypeScript)
│   └── Pages (Code editor, graph visualization)
└── Docker setup (docker-compose)
```

## Recommended Deployment Strategy

### Option 1: Vercel + Render (RECOMMENDED FOR YOU)
- **Frontend**: Vercel (optimized for Next.js)
- **Backend**: Render (Docker support, code execution capabilities)
- **Pros**: Easy setup, free tier available, good for your use case
- **Cons**: Render has execution time limits (30s per request)

### Option 2: Railway / Fly.io
- Both frontend and backend in one place
- Better for full Docker support
- Pay-as-you-go pricing

---

## PRECAUTIONS & IMPORTANT CHECKS

### 1. **Environment Variables**
- [ ] Backend needs `CORS_ORIGIN` to point to your Vercel frontend domain
- [ ] Frontend needs `NEXT_PUBLIC_API_URL` to point to your Render backend
- [ ] No hardcoded localhost URLs
- [ ] Add `.env.production` files

### 2. **Code Execution Limitations**
- [ ] Render has 30-second request timeout (your large input sizes may timeout)
- [ ] 512MB memory limit is reasonable for code execution
- [ ] Java/C++/Python compilers add ~200MB overhead
- [ ] Custom test cases should be small (<10MB input)

### 3. **Security**
- [ ] CORS is properly configured
- [ ] No API keys exposed
- [ ] Input validation for code submissions
- [ ] Timeout protection (already in place)
- [ ] Rate limiting (consider adding)

### 4. **Database**
- [ ] MongoDB: You have mongoose dependency but no DB configured
- [ ] Decide: Keep in-memory (no persistence) or add MongoDB Atlas

### 5. **Performance**
- [ ] Monaco editor lazy loading (check frontend Dockerfile)
- [ ] API response times with network latency
- [ ] Image optimization (chart.js should be fine)

### 6. **Deployment Readiness**
- [ ] Remove nodemon from production start script ❌ **ISSUE FOUND**
- [ ] Frontend build optimization
- [ ] Health checks configured ✓
- [ ] Docker images optimized ✓

---

## DEPLOYMENT STEPS

### STEP 1: Prepare Your Code

#### Fix Backend package.json
**ISSUE**: `start` script uses `nodemon` (development tool)

Replace:
```json
"start": "nodemon index.js"
```

With:
```json
"start": "node index.js"
```

#### Create .env.production files

**Backend/.env.production:**
```env
NODE_ENV=production
PORT=9092
CORS_ORIGIN=https://your-vercel-domain.vercel.app
USE_DOCKER=false
```

**frontend/.env.production:**
```env
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
```

### STEP 2: Deploy Backend to Render

1. Go to [render.com](https://render.com)
2. Sign up and connect GitHub
3. Create new **Web Service**
4. Select your GitHub repo
5. Configuration:
   - **Name**: `dsa-runtime-backend`
   - **Build Command**: `npm install`
   - **Start Command**: `cd Backend && npm start`
   - **Environment**: Select `Docker`
   - **Instance Type**: Standard (Shared CPU, 0.5GB RAM)
   - **Auto-deploy**: Yes
6. Add Environment Variables:
   - `CORS_ORIGIN`: `https://your-vercel-domain.vercel.app`
   - `NODE_ENV`: `production`
7. Deploy
8. Copy the Render URL (e.g., `https://dsa-runtime-backend.onrender.com`)

### STEP 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up and connect GitHub
3. Import your repo
4. Configuration:
   - **Framework**: Next.js
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
   ```
6. Deploy
7. Your app will be at `https://your-project.vercel.app`

### STEP 4: Update Backend CORS

Go back to Render dashboard:
1. Edit Web Service settings
2. Update `CORS_ORIGIN` environment variable with your Vercel URL
3. Redeploy

---

## TESTING DEPLOYMENT

### Test Backend Health
```bash
curl https://your-render-backend.onrender.com/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test Frontend
Visit `https://your-vercel-domain.vercel.app`

### Test API Call
```bash
curl -X POST https://your-render-backend.onrender.com/api/submit \
  -H "Content-Type: application/json" \
  -d '{"code":"static void solve(int n) {}","lang":"java","tags":["custom"],"inputType":"int","customTestCases":["5"]}'
```

---

## COMMON ISSUES & SOLUTIONS

### Issue 1: "CORS Error" / 403
**Solution**: 
- Check `CORS_ORIGIN` in Render environment matches Vercel domain
- Include `http://localhost:3000` for local testing

### Issue 2: Backend Timeout (>30s execution)
**Solution**:
- Large input sizes will timeout on Render free tier
- Reduce input from 1M to 100K elements
- Consider upgrading to paid plan

### Issue 3: "Cannot find module"
**Solution**:
- Ensure `cd Backend &&` in Render start command
- Or restructure to have Backend at root (advanced)

### Issue 4: Monaco Editor not loading
**Solution**:
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Vercel cache: redeploy frontend

---

## COST ESTIMATES

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel | ✓ Unlimited | $20/month |
| Render | ✓ 750 hours/month | $7+ per service |
| Railway | ✗ Pay-as-you-go | ~$5/month |

---

## IMPORTANT FIXES NEEDED BEFORE DEPLOYMENT

### ❌ CRITICAL: Backend Start Script
Your `Backend/package.json` has:
```json
"start": "nodemon index.js"
```

This will FAIL in production. Must be:
```json
"start": "node index.js"
```

### ⚠️ Recommendation: Add Health Check Endpoint
Your backend has it ✓, but make sure it's accessible:
```
GET /health → {"status":"ok"}
```

### ⚠️ Recommendation: Add Rate Limiting
Consider adding express-rate-limit for /api/submit

---

## FINAL CHECKLIST

- [ ] Fix Backend start script (nodemon → node)
- [ ] Create .env.production files
- [ ] Push changes to GitHub
- [ ] Create Render account
- [ ] Create Vercel account
- [ ] Deploy Backend to Render
- [ ] Deploy Frontend to Vercel
- [ ] Update CORS_ORIGIN in Render
- [ ] Test health endpoint
- [ ] Test API call from frontend
- [ ] Test code execution (small input)
- [ ] Share live URL with users

---

## Next Steps

1. Fix the nodemon issue immediately
2. Create environment variable files
3. Push to GitHub
4. Start with Render deployment (takes 5-10 min)
5. Then deploy to Vercel (takes 2-3 min)
6. Test everything

Would you like me to help fix the nodemon issue now?
