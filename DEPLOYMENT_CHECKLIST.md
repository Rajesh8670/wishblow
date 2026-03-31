# Pre-Deployment Checklist

## ✅ Before Committing to GitHub

### Environment & Security
- [ ] `.env` file is NOT committed (should be in .gitignore)
- [ ] `.env.example` is committed with placeholder values only
- [ ] No API keys or passwords in code files
- [ ] No hardcoded MongoDB URIs in source code
- [ ] Sensitive files listed in .gitignore

### Code Quality
- [ ] No console.log/debug statements in production code
- [ ] All imports are correct and used
- [ ] TypeScript has no compilation errors
- [ ] ESLint checks pass (`npm run lint`)
- [ ] No warning messages during build

### Dependencies
- [ ] package-lock.json is committed
- [ ] package.json has all required dependencies
- [ ] node_modules is in .gitignore
- [ ] No unnecessary packages installed

### Project Structure
- [ ] README.md has complete setup instructions
- [ ] .env.example shows all required variables
- [ ] Server code is in `/server` directory
- [ ] Frontend code is in `/src` directory
- [ ] No temporary files in root directory

### Database
- [ ] MongoDB models are defined in `/server/models`
- [ ] Database configuration uses environment variables
- [ ] Connection string uses MongoDB Atlas format

### Frontend Configuration
- [ ] API base URL uses environment variables
- [ ] Vite config properly proxies API calls
- [ ] Assets are in `/public` directory
- [ ] Build output goes to `/dist` (in .gitignore)

### Build & Runtime
- [ ] `npm run build` completes without errors
- [ ] `npm run server` starts without errors
- [ ] `npm run dev` works correctly
- [ ] All pages load and display correctly

## 🚀 Deployment Steps

1. **Prepare Repository**
   ```bash
   git add .
   git commit -m "Initial project setup with birthday celebration features"
   git push origin main
   ```

2. **Configure Hosting Platform**
   - Set environment variables (MONGODB_URI, MONGODB_DB, PORT)
   - Ensure Node.js version matches (v16+)
   - Configure build command: `npm run build`
   - Configure start command: `npm run server`

3. **Test Deployment**
   - Check health endpoint: `/api/health`
   - Test creating a celebration
   - Test retrieving celebration data
   - Verify audio playback

4. **Post-Deployment**
   - Monitor server logs
   - Check error tracking
   - Verify MongoDB connection
   - Test all features end-to-end

## 📝 Important Notes

- Audio file (`public/happy-birthday.webm`) must be added separately
- MongoDB Atlas allows free tier with limitations
- CORS is enabled for all origins in development
- For production, consider restricting CORS origins
- Backup database regularly using MongoDB Atlas

## 🔗 Helpful Links

- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [Vercel Deployment](https://vercel.com/docs)
- [Environment Variables Best Practices](https://12factor.net/config)
