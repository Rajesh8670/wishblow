# Quick Deployment Guide

## Fastest Way to Deploy Wishblow

### Option 1: Vercel (Recommended - 5 minutes)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Connect Your Repository**
   - Click "Import Project"
   - Select your GitHub repository

3. **Add Environment Variables**
   - Set `MONGODB_URI`
   - Set `MONGODB_DB`
   - Set `PORT=4000`

4. **Deploy**
   - Click "Deploy"
   - Your app is live!

⏱️ **Time: ~5 minutes**

---

### Option 2: Railway.app (10 minutes)

1. **Create Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from Github"

3. **Configure**
   - Add environment variables
   - Set Node.js version

4. **Deploy**
   - Railway deploys automatically

⏱️ **Time: ~10 minutes**

---

### Option 3: Self-Hosted (30-60 minutes)

1. **Get a Server**
   - AWS EC2, DigitalOcean, Linode, etc.
   - Minimum: 1GB RAM, 1vCPU

2. **Install Dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y git
   ```

3. **Clone & Setup**
   ```bash
   git clone <your-repo-url>
   cd wishblow
   npm install
   ```

4. **Set Environment Variables**
   ```bash
   nano .env
   # Add: MONGODB_URI=...
   # Add: MONGODB_DB=...
   # Save and exit
   ```

5. **Run with PM2**
   ```bash
   npm install -g pm2
   pm2 start "npm run server" --name wishblow
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt-get install nginx
   # Setup reverse proxy to localhost:4000
   ```

⏱️ **Time: 30-60 minutes depending on familiarity**

---

## Platform-Specific Instructions

### Vercel
```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=WishBlow
PORT=4000
```

### Railway
```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=WishBlow
PORT=$PORT (automatically provided)
```

### AWS Lambda + API Gateway
- Requires serverless framework
- Use MongoDB Atlas (required)
- Customize for stateless execution

---

## Environment Setup Checklist

Before deploying anywhere:

```bash
# 1. Verify .env.example is in repo
✓ .env.example exists

# 2. Verify .env is in .gitignore
grep ".env" .gitignore

# 3. No secrets in code
grep -r "mongo" src/ --exclude-dir=node_modules

# 4. Build test
npm run build

# 5. Server test (local only)
npm run server
```

---

## Post-Deployment Testing

After deploying, test these endpoints:

```bash
# Health Check
curl https://your-domain.com/api/health

# Should return:
# {"ok":true,"mongoState":"connected"}
```

---

## Troubleshooting Checklist

| Problem | Solution |
|---------|----------|
| Can't connect to MongoDB | Check credentials in env vars, IP whitelist in Atlas |
| 404 on API endpoints | Verify backend is running, CORS configured |
| Audio not playing | Ensure webm file in `/public`, check browser policies |
| Build fails | Check Node.js version (v16+), run `npm install` |
| Database empty | Create collections in MongoDB Atlas first |

---

## Cost Estimation

| Platform | Free Tier | Monthly |
|----------|----------|---------|
| **Vercel** | Yes | $0-20+ |
| **Railway** | $5/month | $5+ |
| **DigitalOcean** | No | $5+ |
| **AWS** | Limited | $0-50+ |
| **MongoDB Atlas** | 512MB free | $0-100+ |

**Recommended:** Vercel Frontend + Railway Backend
