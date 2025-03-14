# Security Access Verification System

An example of a full-stack application that helps Software Engineers verify their security access and tool profile status. The system checks for VPN access, production group membership, and configuration tool access, while also verifying the correct tool profile for accessing resources.

## Tech Stack

### Backend
- FastAPI (Python web framework)
- Python 3.8+
- Uvicorn (ASGI server)

### Frontend
- TypeScript
- React
- Vite (Build tool)

## Features

- Real-time access status verification
- One-click production access refresh
- Automatic profile switching recommendations


## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## Setup



1. Set up the backend:

```bash
# Create and activate virtual environment
python3 -m venv env
source env/bin/activate  # On Windows: .\env\Scripts\activate

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

2. Set up the frontend:

```bash
# Install frontend dependencies
cd frontend
npm install
```

## Running the Application

1. Start the backend server:

```bash
# From the backend directory
cd backend
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`
API documentation is available at `http://localhost:8000/docs`

2. Start the frontend development server:

```bash
# From the frontend directory
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Enter your username to begin the access verification process
3. The system will display your current access status and tool profile information
4. Follow any prompts to switch profiles or request additional access as needed

## Test Users

The system comes with two pre-configured test users:

- `Alice Mc'Prod`: Has full access (VPN, production, config tool)
- `Bob Mc'NoProd`: Has limited access (VPN and config tool only)

## Development

- Backend code is in the `backend/app` directory
- Frontend code is in the `frontend/src` directory
- Mock data and access rules are defined in `backend/app/data.py`
- API endpoints are defined in `backend/app/main.py`
- Frontend components are in `frontend/src/components`
- Frontend routing is handled in `frontend/src/App.tsx`

