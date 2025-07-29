# AI-Powered Notes Vault

A modern, intelligent note-taking application built with React, Firebase, and AI integration. Features include real-time collaboration, semantic search, automatic summarization, and smart tagging.

## 🚀 Features

### ✅ Implemented Features

- **🔐 Authentication System**
  - Email/password authentication via Firebase
  - User registration and login
  - Protected routes and role-based access control
  - User profile management

- **📝 Rich Note Editor**
  - Rich text editing with ReactQuill
  - Auto-save functionality
  - Draft persistence in localStorage
  - Real-time AI processing

- **🤖 AI Integration**
  - Automatic note summarization
  - Smart tag generation
  - Semantic search with embeddings
  - Content analysis and enhancement

- **🔍 Advanced Search**
  - Text-based search
  - Semantic/AI-powered search
  - Tag filtering
  - Real-time search results

- **🎨 Modern UI/UX**
  - Dark/light theme toggle
  - Responsive design with Tailwind CSS
  - Grid and list view modes
  - Intuitive navigation

- **💾 Data Management**
  - Firebase Firestore integration
  - LocalStorage fallback
  - Note versioning and history
  - Real-time synchronization

- **🔒 Security & Privacy**
  - User-based note ownership
  - Role-based access control
  - Secure data transmission
  - Privacy-focused design

## 🛠️ Tech Stack

- **Frontend**: React 18, JavaScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI Services**: OpenAI API (GPT-3.5, Embeddings)
- **Editor**: ReactQuill
- **Routing**: React Router DOM
- **Build Tool**: Create React App

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-powered-notes-vault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy your Firebase config and update `src/services/firebase.js`

4. **Set up OpenAI API (Optional)**
   - Get an API key from [OpenAI](https://platform.openai.com)
   - Create a `.env` file in the root directory:
     ```
     REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
     ```

5. **Start the development server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Firebase Setup

Update `src/services/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### AI Features

**🔐 Security Notice:** This app uses secure mock AI functionality. Real OpenAI API keys should **NEVER** be used in frontend applications as they get exposed in the browser.

**Current Implementation:**
- ✅ Enhanced mock AI with intelligent summaries and tagging
- ✅ Secure - no API keys exposed to users
- ✅ Fully functional for demonstration and development

**For Production AI:**
- Create a backend API to handle OpenAI calls securely
- Keep API keys on the server side only
- Frontend makes requests to your secure backend

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── NoteCard.jsx    # Individual note display
│   ├── NoteEditor.jsx  # Rich text note editor
│   ├── ProtectedRoute.jsx # Route protection
│   └── SearchBar.jsx   # Search functionality
├── context/            # React context providers
│   ├── AuthContext.jsx # Authentication state
│   └── ThemeContext.jsx # Theme management
├── pages/              # Main application pages
│   ├── Dashboard.jsx   # Main notes dashboard
│   ├── Login.jsx       # User login
│   ├── Register.jsx    # User registration
│   └── Unauthorized.jsx # Access denied page
├── services/           # External service integrations
│   ├── ai.js          # AI/OpenAI integration
│   ├── firebase.js    # Firebase configuration
│   └── notesService.js # Note CRUD operations
├── utils/              # Utility functions
├── App.jsx            # Main application component
└── index.js           # Application entry point
```

## 🎯 Usage

1. **Getting Started**
   - Register a new account or login
   - Start creating notes with the "New Note" button

2. **Creating Notes**
   - Use the rich text editor to write your notes
   - Add tags for better organization
   - AI will automatically generate summaries and suggest tags

3. **Searching Notes**
   - Use the search bar for text-based search
   - Switch to "AI Search" for semantic search
   - Filter by tags and content

4. **Managing Notes**
   - Edit notes by clicking on them
   - Delete notes from the card menu
   - View note history and versions

## 🔮 Future Enhancements

- **Real-time Collaboration**: Multi-user editing with WebSockets
- **Offline Mode**: PWA with IndexedDB for offline access
- **File Attachments**: Support for images and documents
- **Export Options**: PDF, Markdown, and other formats
- **Advanced Analytics**: Usage statistics and insights
- **Mobile App**: React Native implementation
- **Voice Notes**: Speech-to-text integration
- **Advanced AI**: Custom AI models and fine-tuning

---

**Built with ❤️ using React and AI**
