# DSA Runtime Analysis System - Quick Deployment Guide

## 🚀 What Was Fixed

✅ **Backend start script** - Changed from `nodemon` (development) to `node` (production)  
✅ **Environment templates** - Created `.env.example` files for both frontend and backend  
✅ **Deployment guide** - See `DEPLOYMENT_GUIDE.md` for detailed instructions  

## ⚡ Quick Start - Deploy in 15 Minutes

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy: Fix production setup"
git push origin main
```

### 2. Deploy Backend to Render
1. Visit [render.com](https://render.com) → Sign up
2. Click **"Create"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Build Command**: `npm install && npm install -g nodemon`
   - **Start Command**: `cd Backend && npm start`
   - **Instance**: Standard (0.5GB RAM)
5. Environment Variables:
   ```
   NODE_ENV=production
   CORS_ORIGIN=https://YOUR-VERCEL-DOMAIN.vercel.app
   ```
6. Deploy (wait 5 minutes)
7. **Copy the Render URL** (e.g., `https://dsa-runtime-backend.onrender.com`)

### 3. Deploy Frontend to Vercel
1. Visit [vercel.com](https://vercel.com) → Sign up
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repo
4. Configure:
   - **Root Directory**: `./frontend`
   - **Framework**: Next.js
5. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://dsa-runtime-backend.onrender.com
   ```
   (Use your Render URL from step 2)
6. Deploy (takes 2 minutes)

### 4. Update Backend CORS
1. Go to Render dashboard
2. Edit your Web Service
3. Update `CORS_ORIGIN` with your Vercel URL:
   ```
   https://YOUR-PROJECT.vercel.app
   ```
4. Deploy

## ✅ Test Your Deployment

### Test 1: Health Check
```bash
curl https://dsa-runtime-backend.onrender.com/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### Test 2: Open Frontend
Visit: `https://YOUR-PROJECT.vercel.app`

### Test 3: Submit Code
1. Add a custom test case (e.g., `5` for int input)
2. Click the ▶ Run button
3. Should see results and graph

## ⚠️ Known Limitations

- **Render timeout**: 30 seconds max per request (your large inputs may timeout)
- **Free tier**: 750 free compute hours per month
- **Cold starts**: First request after 15 minutes of inactivity takes 10-15 seconds

## 🔧 If Something Breaks

| Issue | Solution |
|-------|----------|
| CORS Error | Check `CORS_ORIGIN` in Render matches Vercel URL |
| Timeout Error | Reduce input size (1M → 100K) or upgrade tier |
| Cannot find Backend | Verify `NEXT_PUBLIC_API_URL` is correct |
| Monaco editor blank | Clear browser cache + hard refresh |

## 📊 Architecture Deployed

```
Vercel (Frontend)
    ↓ (HTTPS)
Render (Backend API) 
    ↓ (Local Docker)
Java/C++/Python Runtime
```

## 🎯 What's Next?

1. **Monitor Render logs** - Check for errors
2. **Test with real data** - Try various input types
3. **Scale if needed** - Upgrade Render instance
4. **Add analytics** - Monitor usage
5. **Custom domain** - Add your domain (optional)

## 📚 Full Documentation

See `DEPLOYMENT_GUIDE.md` for:
- Detailed architecture overview
- All precautions and security checks
- Troubleshooting guide
- Cost estimation
- Database setup (if needed)

## 🆘 Help

If deployment fails:
1. Check Render logs for errors
2. Check Vercel logs for errors
3. Verify environment variables
4. Test health endpoint
5. Check GitHub shows latest code

Good luck! 🚀
