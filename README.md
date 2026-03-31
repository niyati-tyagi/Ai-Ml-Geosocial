# Ai-Ml GeoSocial 🌍

Ai-Ml GeoSocial is a modern, location-based social web application designed to help users discover, join, and interact through local activities and events. Built with React and powered by Firebase, it features an interactive map interface and integrates the Google Gemini AI for smart location-based search capabilities.

## Features ✨

- **Interactive Map:** Discover activities around you using a dynamic map interface powered by Leaflet.
- **AI-Powered Search:** Search for activities or locations using natural language. The Gemini API translates your query into precise coordinates.
- **Real-Time Database:** Live updates of activities and chat messages using Firebase Firestore.
- **Authentication:** Secure Google Sign-In via Firebase Auth.
- **Live Chat:** Real-time messaging for each activity to connect with other attendees.
- **Modern UI:** Built with Tailwind CSS and Framer Motion for a sleek, responsive, and animated user experience.

## Tech Stack 🛠

- **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion
- **Maps:** Leaflet, React Leaflet
- **Backend/BaaS:** Firebase (Authentication, Firestore Database)
- **AI Integration:** Google GenAI (Gemini)
- **Language:** TypeScript

## Setup & Installation 🚀

Follow these instructions to set up the project locally.

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- A Firebase project
- A Google Gemini API Key

### 2. Clone the Repository
If you haven't already:
```bash
git clone <your-repository-url>
cd Ai-Ml-GeoSocial
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables
Create a `.env` file in the root directory and add your keys:
```env
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_firebase_app_id"
GEMINI_API_KEY="your_gemini_api_key"
```
*(Refer to `.env.example` if available)*

### 5. Run the Application Locally
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` (or the port specified in your terminal).

## Usage 💡
1. **Explore:** Move around the map to see pinned activities.
2. **Search:** Use the search bar to find specific locations or activities. If you search for a city (e.g., "Delhi"), the AI will automatically find its coordinates and move the map.
3. **Login:** Click the "Login" button securely sign in with your Google account.
4. **Join & Chat:** Click on an activity to see its details. "Join" the activity to let others know you're interested, and open the chat to connect with fellow attendees.
