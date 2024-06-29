// Import necessary modules
const express = require('express');
const fs = require('fs');
const cors = require('cors'); // Import cors module

// Create an Express app
const app = express();
app.use(express.json());
app.use(cors()); // Allow all CORS requests

// Define GET endpoint to serve memory-data.json
app.get('/memory-data', (req, res) => {
    try {
        res.sendFile(__dirname + '/memory-data.json');
    } catch (error) {
        console.error("Error reading memory-data.json file");
        res.status(500).send('Internal Server Error');
    }
});

// Define GET endpoint to serve chart.html and supply data from memory-data.json
app.get('/chart', (req, res) => {
    try {
        res.sendFile(__dirname + '/chart.html');
    } catch (error) {
        console.error("Error reading memory-data.json file");
        res.status(500).send('Internal Server Error');
    }
});

// Define POST endpoint to receive time and memory data
app.post('/api/data', (req, res) => {
    const { time, memory } = req.body;

    // Load existing data from memory-data.json
    let data = [];
    try {
        data = JSON.parse(fs.readFileSync('memory-data.json'));
    } catch (error) {
        console.error("Error reading memory-data.json file");
    }

    // Append new data to the existing array
    data.push({ time, memory });

    // Write the updated data back to memory-data.json
    fs.writeFileSync('memory-data.json', JSON.stringify(data, null, 2));

    res.send('Data appended successfully');
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});