# AI LEXER - Chat Application

A modern AI-powered chat application with file upload, voice input, and multi-platform authentication.

## Features

- 🤖 AI-powered chat with streaming responses
- 🎤 Voice input support
- 📁 File upload (PDFs, documents, images)
- 🔐 Multiple authentication methods (Google, Facebook, Email)
- 💾 Chat history management (localStorage)
- 🎨 Beautiful dark mode UI with animations
- 📱 Responsive design

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 1. Server Setup

```bash
cd server
npm install
```

#### Configure Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_super_secret_jwt_key_here
MONGODB_URI=mongodb://127.0.0.1:27017/ai-assistant
DISABLE_MONGODB=true  # Set to false if you have MongoDB running
```

#### Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Replace `your_gemini_api_key_here` with your actual key

#### Start Server

```bash
node server.js
```

The server will run on `http://localhost:5000`

### 2. Client Setup

```bash
cd client
npm install
```

#### Configure Environment Variables

Create a `.env` file in the client directory:

```env
# Firebase Configuration (Optional - for Google/Facebook auth)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

#### Get Firebase Configuration (Optional)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Google and Facebook providers)
4. Copy your Firebase config to the `.env` file

#### Start Client

```bash
npm run dev
```

The client will run on `http://localhost:5173`

## Usage

1. Open `http://localhost:5173` in your browser
2. Choose authentication method:
   - **Skip for now**: Use the app in anonymous mode
   - **Email/Password**: Register or login with email
   - **Google/Facebook**: Sign in with OAuth (requires Firebase setup)
3. Start chatting with AI LEXER
4. Upload files for document analysis
5. Use voice input for hands-free messaging

## Features Details

### Mock Mode

If the Gemini API key is not configured or invalid, the app will run in mock mode with placeholder responses.

### MongoDB Optional

The application can run without MongoDB by setting `DISABLE_MONGODB=true` in the server `.env` file. Chat history will be stored in localStorage instead.

### File Support

- **PDFs**: Text extraction for document analysis
- **Images**: Base64 encoding for visual analysis
- **Text files**: Direct content reading

## Troubleshooting

### "Error connecting to the server"

- Ensure the backend server is running on port 5000
- Check if the API key is valid
- Verify MongoDB connection if not using mock mode

### "MongoDB connection error"

- Set `DISABLE_MONGODB=true` in server `.env` to run without database
- Or ensure MongoDB is running locally or provide a valid MongoDB URI

### Firebase not working

- Firebase authentication is optional
- You can skip authentication and use the app in anonymous mode
- To enable OAuth, complete the Firebase setup in the `.env` file

## Project Structure

```
ai gpt/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── index.css       # Global styles
│   └── package.json
└── server/                 # Express backend
    ├── models/             # Mongoose models
    ├── routes/             # API routes
    ├── uploads/            # File upload directory
    └── server.js           # Main server file
```

## Technologies Used

### Frontend
- React 19
- Vite
- React Router
- Lucide React (icons)
- React Markdown
- React Syntax Highlighter
- Firebase (optional)

### Backend
- Express.js
- Google Generative AI SDK
- Multer (file uploads)
- PDF Parse
- Mongoose (optional)
- JWT (authentication)
- Bcrypt (password hashing)

## License

ISC
