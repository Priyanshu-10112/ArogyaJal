const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the public directory (React build)
app.use(express.static(path.join(__dirname, 'build')));

// API routes for the dashboard
app.get('/api/alerts', (req, res) => {
  // Mock API endpoint for alerts
  res.json([
    {
      id: 1,
      title: "High Turbidity Alert",
      description: "Turbidity levels above safe threshold detected",
      severity: "high",
      status: "open",
      timestamp: new Date().toISOString(),
      village: "Majuli",
      deviceId: "DEV-1001"
    }
  ]);
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`React app available at: http://localhost:${port}`);
});
