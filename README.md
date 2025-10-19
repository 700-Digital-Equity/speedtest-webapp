# Internet Speed Test Web App

This is a full-stack web application designed to measure internet quality including metrics such as download speed, upload speed, ping, jitter, and packet loss. The app provides a user-friendly interface for running speed tests, viewing historical results, and analyzing data through graphs and tables.

## Features

- **Speed Test**: Measure download, upload, ping, jitter, and packet loss.
- **Live Results**: View real-time updates of speed test metrics.
- **Historical Data**: Save and view past test results.
- **Data Visualization**: Analyze results using graphs and tables.
- **Leaderboard**: Compare results with others.
- **School Integration**: Associate results with schools using unique codes.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## File Structure

### Frontend (`frontend/`)
The frontend is built with React and Vite. It includes components for the user interface, graphs, and styles.

- **`index.html`**: Entry point for the frontend.
- **`vite.config.js`**: Configuration for Vite.
- **`src/`**: Contains the main application code.
  - **`App.jsx`**: Main application component.
  - **`components/`**: React components for the app.
    - **`SpeedTest.jsx`**: Core component for running speed tests.
    - **`ResultsDashboard.jsx`**: Displays test results with filtering and sorting.
    - **`Leaderboard.jsx`**: Displays top results in a leaderboard format.
    - **`CodeLogin.jsx`**: Handles user login with school codes.
    - **`RegionAverages.jsx`**: Shows average metrics for a region.
    - **`FloatingResultsTable.jsx`**: Draggable and resizable table for results.
  - **`graphs/`**: Components for data visualization.
    - **`DownloadUploadLineGraph.jsx`**: Line graph for download/upload speeds over time.
    - **`LatencyJitterLineGraph.jsx`**: Line graph for latency and jitter over time.
    - **`AverageSpeedByDayLineGraph.jsx`**: Line graph for average speeds grouped by day.
    - **`ResultsHeatMap.jsx`**: Heatmap visualization of results on a map.
  - **`styles/`**: CSS modules for styling.
    - **`leaderboard.module.css`**: Styles for the leaderboard.
    - **`speedtestform.module.css`**: Styles for the speed test form.
  - **`utils/`**: Utility functions.
    - **`api.js`**: Handles API requests to the backend.
  - **`hooks/`**: Custom React hooks.
    - **`useLocationFromGeo.js`**: Converts geolocation data into readable locations.

### Backend (`backend/`)
The backend is built with Node.js and Express, using MongoDB for data storage.

- **`server.js`**: Main server file, sets up routes and middleware.
- **`models/`**: Mongoose models for the database.
  - **`User.js`**: Schema for user data.
  - **`School.js`**: Schema for school data.
  - **`Result.js`**: Schema for test results.
- **`routes/`**: API routes.
  - **`results.js`**: Handles result-related endpoints (e.g., saving and fetching results).
- **`auth/`**: Authentication logic.
  - **`auth.js`**: Functions for user authentication and session management.
- **`scripts/`**: Utility scripts for database management.
  - **`insertSchool.js`**: Script to add a school to the database.
  - **`importSchools.js`**: Script to import schools from an Excel file.
  - **`updateSchoolLocations.js`**: Script to update school locations.

### Public Assets (`frontend/public/`)
- **`ping.json`**: Used for measuring ping.
- **`10MB.test`**: Test file for download speed.

## Getting Started

### Prerequisites
- Node.js
- MongoDB

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/speedtest-webapp.git
   cd speedtest-webapp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```
