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
3. Set up the backend:
   - Create a `.env` file in the `backend/` directory based on the `.env.example` file.
   - Start the MongoDB server.
   - Run the backend:
     ```bash
     cd backend
     node server.js
     ```
4. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Usage

1. Open the app in your browser (usually at `http://localhost:3000`).
2. Run a speed test by clicking the "Run Test" button.
3. View real-time results and historical data in the dashboard.
4. Analyze data using the provided graphs and tables.
5. Compare your results with others on the leaderboard.
6. For school associations, enter the unique school code during login.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your branch to your forked repository.
5. Create a pull request describing your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
