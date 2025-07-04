# EunoiaFlow - AI-Powered Productivity Planner

EunoiaFlow is a comprehensive productivity application that combines task management, focus timing, and AI assistance to help you achieve peak productivity. Built with FastAPI, React, and integrated with Azure OpenAI.

## Features

### Core Features ✨
- **Smart Task Management**: Create, organize, and track tasks with priorities, tags, and due dates
- **Focus Timer**: Pomodoro technique with customizable work/break durations
- **AI Assistant**: Chat with an intelligent AI that helps with productivity insights and task suggestions
- **Real-time Updates**: WebSocket-powered live updates for timers and notifications
- **Productivity Analytics**: Track your focus time, task completion rates, and productivity patterns

### Widgets 🎯
- **Tasks Widget**: Comprehensive task management with filtering and search
- **Timer Widget**: Visual Pomodoro timer with session tracking
- **AI Chat Widget**: Interactive AI assistant for productivity guidance
- **Stats Widget**: Real-time productivity metrics and insights
- **Quick Actions**: Fast access to common actions and AI-powered suggestions

### Customization 🎨
- **Modular Dashboard**: Enable/disable widgets based on your needs
- **Dark/Light Theme**: Automatic theme switching with user preference
- **AI Personality**: Choose from different AI interaction styles
- **Notification Settings**: Customizable alerts and sound preferences

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework with automatic API documentation
- **SQLAlchemy**: SQL toolkit and ORM for database operations
- **SQLite**: Lightweight database for local-first storage
- **Azure OpenAI**: GPT-4 integration for AI features
- **WebSockets**: Real-time communication for live updates
- **JWT Authentication**: Secure user authentication

### Frontend
- **React 18**: Modern frontend library with hooks
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Vite**: Fast build tool and development server
- **Axios**: HTTP client for API communication
- **React Router**: Client-side routing
- **Lucide React**: Beautiful icon library

## Prerequisites

- **Python 3.10+** (for backend)
- **Node.js 16+** (for frontend)
- **Azure OpenAI Account** with API key
- **Git** (for cloning the repository)

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd eunoiaflow
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (Windows)
python -m venv .venv
.venv\Scripts\activate

# Create virtual environment (macOS/Linux)
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
copy .env.example .env
# Edit .env file and add your Azure OpenAI API key

# Initialize database
python -c "from app.db import create_tables; create_tables()"

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Install dependencies
npm install

# Create environment file
copy .env.example .env

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Azure OpenAI Configuration

1. **Get Azure OpenAI API Key**:
   - Go to [Azure Portal](https://portal.azure.com/)
   - Navigate to your Azure OpenAI resource
   - Copy your API key and endpoint

2. **Update Backend Environment**:
   ```env
   AZURE_OPENAI_KEY=your-actual-api-key-here
   AZURE_OPENAI_ENDPOINT=your-endpoint-url
   ```

3. **Test AI Features**:
   - Register a new account or login
   - Try the AI Chat widget
   - Use Quick Actions for AI suggestions

## Project Structure

```
eunoiaflow/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI application entry point
│   │   ├── models.py          # SQLAlchemy database models
│   │   ├── schemas.py         # Pydantic schemas for API
│   │   ├── db.py              # Database configuration
│   │   ├── routers/           # API route handlers
│   │   │   ├── auth.py        # Authentication endpoints
│   │   │   ├── tasks.py       # Task management endpoints
│   │   │   ├── timer.py       # Timer and session endpoints
│   │   │   ├── ai.py          # AI assistant endpoints
│   │   │   ├── feeds.py       # Content feed endpoints
│   │   │   └── user_settings.py # User preferences
│   │   └── services/          # Business logic services
│   │       ├── ai_service.py  # Azure OpenAI integration
│   │       └── websocket_manager.py # Real-time communication
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment variables template
│   └── alembic.ini           # Database migration configuration
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── widgets/       # Dashboard widgets
│   │   │   │   ├── TasksWidget.jsx
│   │   │   │   ├── TimerWidget.jsx
│   │   │   │   ├── AIChat.jsx
│   │   │   │   ├── StatsWidget.jsx
│   │   │   │   └── QuickActionsWidget.jsx
│   │   │   ├── Navbar.jsx     # Navigation component
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/             # Main application pages
│   │   │   ├── Dashboard.jsx  # Main dashboard
│   │   │   ├── Login.jsx      # Authentication
│   │   │   ├── Register.jsx   # User registration
│   │   │   └── Settings.jsx   # User preferences
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.jsx # Authentication state
│   │   ├── services/          # API and external services
│   │   │   └── api.js         # API client and WebSocket
│   │   ├── App.jsx            # Main application component
│   │   ├── main.jsx           # Application entry point
│   │   └── index.css          # Global styles and Tailwind
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.js         # Build configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── .env.example           # Environment variables template
└── README.md                  # This file
```

## Development Workflow

### Starting Development
```bash
# Terminal 1 - Backend
cd backend
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Making Changes
1. **Backend Changes**: FastAPI will auto-reload when you modify Python files
2. **Frontend Changes**: Vite will hot-reload when you modify React components
3. **Database Changes**: Use Alembic for migrations when modifying models

### Testing the Application
1. **Register a new account** at `http://localhost:5173/register`
2. **Login** and explore the dashboard
3. **Create tasks** using the Tasks widget
4. **Start a focus session** with the Timer widget
5. **Chat with AI** for productivity insights
6. **Customize settings** to your preferences

## API Documentation

Once the backend is running, you can explore the API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

#### Tasks
- `GET /api/tasks` - List user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/{id}/toggle` - Toggle task completion

#### Timer
- `POST /api/timer/sessions` - Start timer session
- `PUT /api/timer/sessions/{id}` - Update session
- `GET /api/timer/stats/daily` - Get daily productivity stats
- `GET /api/timer/stats/weekly` - Get weekly productivity stats

#### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/task-suggestions` - Get AI task suggestions
- `POST /api/ai/analyze-productivity` - Get productivity analysis

## Deployment

### Environment Variables for Production
```env
# Backend (.env)
SECRET_KEY=your-super-secure-secret-key-for-production
DEBUG=False
AZURE_OPENAI_KEY=your-azure-openai-api-key
DATABASE_URL=postgresql://user:password@localhost/eunoiaflow  # For PostgreSQL

# Frontend (.env)
VITE_API_URL=https://your-backend-domain.com
VITE_WS_URL=wss://your-backend-domain.com
```

### Docker Deployment (Optional)
```dockerfile
# Dockerfile for backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Dockerfile for frontend
FROM node:18-alpine
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

## Troubleshooting

### Common Issues

#### Backend Issues
1. **"Module not found" errors**: Ensure virtual environment is activated and dependencies are installed
2. **Database errors**: Run `python -c "from app.db import create_tables; create_tables()"`
3. **Azure OpenAI errors**: Check your API key and endpoint in `.env` file
4. **CORS errors**: Verify CORS_ORIGINS includes your frontend URL

#### Frontend Issues
1. **"Network Error"**: Ensure backend is running on port 8000
2. **Build errors**: Clear node_modules and run `npm install` again
3. **Authentication issues**: Check if JWT tokens are being stored in localStorage

#### WebSocket Issues
1. **Real-time features not working**: Check WebSocket connection in browser dev tools
2. **Timer updates not syncing**: Verify WebSocket URL in environment variables

### Getting Help

1. **Check the console**: Look for error messages in browser console and terminal
2. **API Documentation**: Use `/docs` endpoint to test API calls directly
3. **Database Inspection**: Use SQLite browser to inspect the database file
4. **Network Tab**: Check browser network tab for failed requests

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m "Add feature description"`
5. Push to your fork: `git push origin feature-name`
6. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with FastAPI and React
- Powered by Azure OpenAI
- Icons by Lucide React
- Styling with Tailwind CSS

---

**Happy Productivity! 🚀**

For questions or support, please open an issue on the repository.