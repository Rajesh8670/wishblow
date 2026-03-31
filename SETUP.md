# Wishblow - Setup Guide for Developers

## First Time Setup (5 minutes)

### Step 1: Clone Repository
```bash
git clone https://github.com/Rajesh8670/wishblow.git
cd wishblow
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File
```bash
cp .env.example .env
```

### Step 4: Configure MongoDB
Edit `.env` and add your MongoDB credentials:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/WishBlow?retryWrites=true&w=majority
MONGODB_DB=WishBlow
PORT=4000
```

**Don't have MongoDB?**
- Sign up free at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and user credentials
- Update `.env` with your connection string

### Step 5: Add Audio File
Place your `happy-birthday.webm` file in:
```
public/happy-birthday.webm
```

## Running Development

### Terminal 1: Start Backend
```bash
npm run server
```
Wait for: `Wishblow API running on http://localhost:4000`

### Terminal 2: Start Frontend
```bash
npm run dev
```
Open: http://localhost:8080

## Testing

### Quick Health Check
```bash
curl http://localhost:4000/api/health
# Expected: {"ok":true,"mongoState":"connected"}
```

### Test Full Flow
1. Visit http://localhost:8080
2. Create a celebration
3. Fill in all fields
4. Submit and check MongoDB

## Common Issues

### "Cannot find module" errors
```bash
npm install
```

### "EADDRINUSE" on port 4000
```bash
# Kill process on port 4000
lsof -i :4000
kill -9 <PID>
```

### MongoDB connection failed
- Check credentials in `.env`
- Verify cluster is running in MongoDB Atlas
- Allow your IP in MongoDB Network Access

### Audio not playing
- Ensure `public/happy-birthday.webm` exists
- Check console for errors
- Browser autoplay might require user interaction first

## Development Tips

### Code Style
- ESLint is configured: `npm run lint`
- Use TypeScript for type safety
- Follow component naming: PascalCase for components

### File Structure
```
src/
├── components/       # Reusable React components
├── pages/           # Page-level components
├── hooks/           # Custom React hooks
├── contexts/        # React Context
├── lib/             # Utility functions
└── App.tsx          # Root component

server/
├── index.cjs        # Express server
└── models/          # MongoDB schemas
```

### Environment Variables
- Frontend only: VITE_* prefix (e.g., VITE_API_URL)
- Backend: Any variable in .env
- Never commit .env with real credentials

## Debugging

### Enable Debug Logs
```bash
DEBUG=* npm run server
```

### Check Mongo Connection
```bash
# In browser console or Node.js
const mongodb = require('mongodb');
// Test connection details
```

### React DevTools
- Install [React DevTools browser extension](https://react-devtools-tutorial.vercel.app/)
- Use Vite dev server hot reload

## Before Committing

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Build test
npm run build

# Check git status
git status

# Ensure no .env file!
git diff --cached | grep "MONGODB_URI"
```

## Useful Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run server` | Start backend |
| `npm run build` | Build for production |
| `npm run lint` | Check code style |
| `npm run test` | Run tests |
| `npm run preview` | Preview production build |

## Project Features to Test

- [ ] Landing page loads and music plays
- [ ] Can create a celebration
- [ ] Can upload photos
- [ ] Can upload memory images (up to 6)
- [ ] Can upload custom audio/BGM
- [ ] 3D cake renders
- [ ] Candle blowing with microphone works
- [ ] Cake cutting animation works
- [ ] Share page generates QR code
- [ ] Celebration page excludes music ✓
- [ ] Mobile responsive

## Getting Help

- Check `/README.md` for overall project info
- Check `/DEPLOYMENT_CHECKLIST.md` before deploying
- Check `/DEPLOYMENT_GUIDE.md` for hosting options
- Open an issue on GitHub

## Next Steps

1. ✅ Complete setup above
2. 📖 Read `README.md` for features
3. 🔍 Explore code structure
4. 🎨 Customize appearance in `/src`
5. 🧪 Test all features
6. 📝 Document your changes
7. 🚀 Deploy when ready

---

**Happy Coding! 🎉**
