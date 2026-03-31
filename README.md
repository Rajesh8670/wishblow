# Wishblow - Virtual Birthday Celebration Platform

## Overview
Wishblow is an interactive platform for creating magical virtual birthday celebrations. Users can create personalized birthday experiences with 3D cakes, animations, memory photos, and custom messages.

## Features
- 🎂 Interactive 3D birthday cake with candle-blowing mechanic
- 🎉 Animated confetti and fireworks effects
- 📸 Memory photo gallery (up to 6 photos)
- 🎵 Background music support
- 🎤 Microphone interaction for blowing candles
- 📱 Share celebrations via QR code and links
- 🗄️ MongoDB database for persistent storage
- 🔗 Google Drive image integration support

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Three.js
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Hosting**: Compatible with Vercel, Netlify, or any Node.js host

## Prerequisites
- Node.js (v16 or higher)
- npm or bun
- MongoDB Atlas account (free tier available)

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/Rajesh8670/wishblow.git
cd wishblow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Then update `.env` with your MongoDB credentials:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/WishBlow?retryWrites=true&w=majority
MONGODB_DB=WishBlow
PORT=4000
```

### 4. Setup MongoDB
- Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create a new cluster and database named `WishBlow`
- Generate database credentials and update `.env`

## Running the Application

### Development Mode
Terminal 1 - Start backend server:
```bash
npm run server
```

Terminal 2 - Start frontend development server:
```bash
npm run dev
```

Frontend: http://localhost:8080  
Backend API: http://localhost:4000

### Production Build
```bash
npm run build
npm run server
```

## Project Structure
```
wishblow/
├── server/              # Node.js/Express backend
│   ├── index.cjs       # Server entry point
│   └── models/         # MongoDB schemas
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── lib/            # Utility functions
│   ├── hooks/          # Custom React hooks
│   └── contexts/       # React context
├── public/             # Static assets
├── .env.example        # Environment template
└── package.json        # Dependencies
```

## API Endpoints

### Health Check
```
GET /api/health
Response: { ok: true, mongoState: "connected" }
```

### Create Celebration
```
POST /api/celebrations
Body: {
  name, age, message, senderName, relationshipTag,
  photoUrl, memoryPhotos, wishText, audioUrl, bgmUrl
}
Response: { id: "celebration_id" }
```

### Get Celebration
```
GET /api/celebrations/:id
Response: { ...celebration data }
```

## Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| MONGODB_URI | MongoDB Atlas connection string | Yes |
| MONGODB_DB | Database name | Yes |
| PORT | Server port (default: 4000) | No |
| VITE_API_URL | Frontend API base URL | No |

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
- Ensure both frontend and backend are deployed
- Update `VITE_API_URL` to your backend URL
- Set all environment variables in hosting platform

## Troubleshooting

### MongoDB Connection Failed
- Verify credentials in `.env`
- Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for development)
- Ensure cluster is active

### CORS Errors
- Backend CORS is enabled for all origins
- Check API base URL configuration

### Audio Not Playing
- Ensure audio file exists in `/public/happy-birthday.webm`
- Check browser autoplay policies
- Click page to trigger playback fallback

## Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License
MIT License - See LICENSE file for details

## Support
For issues or questions, please open an issue on GitHub or contact the maintainers.