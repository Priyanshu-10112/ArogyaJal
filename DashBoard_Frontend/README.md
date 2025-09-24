# ArogyaJal Dashboard

A modern React.js dashboard for real-time monitoring of water quality metrics, powered by Firebase Firestore for live data updates and a Spring Boot backend for data processing.

## Features

- **Real-time Data**: Live updates of water quality metrics from connected sensors
- **Firebase Integration**: Secure, scalable cloud database with real-time synchronization
- **Interactive Dashboard**: Visualize sensor data with intuitive charts and gauges
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Alert System**: Get notified of critical water quality issues
- **Historical Data**: View trends and historical sensor readings

## Tech Stack

- **Frontend**: React.js with TypeScript
- **State Management**: React Hooks & Context API
- **UI Components**: Custom components with CSS Modules
- **Real-time Data**: Firebase Firestore
- **Charts**: Chart.js with react-chartjs-2
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Font Awesome

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v8 or later) or yarn
- Firebase Project (for data storage)
- Google account (for Firebase authentication)

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Add a new web app to your Firebase project
3. Copy the Firebase configuration object
4. Create a `.env` file in the project root and add your Firebase config:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd arogya-jal-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```
   The app will be available at `http://localhost:3000`

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Alerts/          # Alert management components
│   └── Map/             # Map visualization components
├── pages/               # Main application pages
│   ├── Dashboard.tsx    # Main dashboard view
│   ├── Trends.tsx       # Data trends and charts
│   └── Map.tsx          # Interactive map view
├── services/            # API services
├── types/               # TypeScript type definitions
├── App.tsx              # Main application component
├── App.css              # Global styles and theming
└── index.tsx            # Application entry point
```

## Firebase Security Rules

For production, set up appropriate security rules in Firebase Console. Here's a recommended configuration:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to sensor readings
    match /sensorReadings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Secure other collections
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Backend API (if used)
REACT_APP_API_URL=http://localhost:8080/api

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Environment (development/production)
NODE_ENV=development
```

## Deployment

### Firebase Hosting

1. Install Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting (if not already done):
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set `build` as your public directory
   - Configure as a single-page app: Yes
   - Set up automatic builds and deploys: No

4. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### Other Hosting Options

For other hosting services (Netlify, Vercel, etc.), simply connect your repository and set the build command to `npm run build` and the publish directory to `build`.

## Available Scripts

- `npm start` - Start the development server
- `npm test` - Run tests
- `npm run build` - Build the app for production
- `npm run serve` - Serve the built application with Express server
- `npm run dev` - Start both React dev server and backend server
- `npm run deploy` - Build and serve the application
- `npm run eject` - Eject from Create React App (irreversible)

## Integration with Spring Boot

This frontend is designed to work with a Spring Boot backend. The following endpoints are expected:

- `GET /api/alerts` - Fetch all alerts
- `PATCH /api/alerts/{id}/status` - Update alert status

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
