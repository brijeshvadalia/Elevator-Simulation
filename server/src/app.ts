import express from 'express';
import cors from 'cors';
import { SimulationService } from './services/SimulationService';
import { SimulationConfig } from './models/Elevator';
import { ReportService } from './services/ReportService';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://elevator-frontend.onrender.com' // Update after frontend deployment
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// Default Configuration
const defaultConfig: SimulationConfig = {
    numberOfFloors: 10,
    numberOfElevators: 4,
    requestFrequency: 0.5,
    simulationSpeed: 1,
    morningPeak: false,
    eveningPeak: false,
    elevatorCapacity: 10
};

let simulationService = new SimulationService(defaultConfig);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Simulation Endpoints
app.get('/state', (req, res) => {
    res.json(simulationService.getState());
});

app.post('/config', (req, res) => {
    const newConfig = { ...defaultConfig, ...req.body };
    simulationService.updateConfig(newConfig);
    res.json({ success: true });
});

app.post('/start', (req, res) => {
    simulationService.startSimulation();
    res.json({ success: true });
});

app.post('/stop', (req, res) => {
    simulationService.stopSimulation();
    res.json({ success: true });
});

app.post('/reset', (req, res) => {
    const config = req.body.config || defaultConfig;
    simulationService = new SimulationService(config);
    res.json({ success: true });
});

// Request Handling
app.post('/request', (req, res) => {
    const { floor, direction } = req.body;
    if (typeof floor !== 'number' || (direction !== 'UP' && direction !== 'DOWN')) {
        return res.status(400).json({ 
          error: 'Invalid request parameters',
          details: {
            expected: { floor: 'number', direction: ['UP', 'DOWN'] },
            received: req.body
          }
        });
    }
    simulationService.addFloorRequest(floor, direction);
    res.json({ success: true });
});

app.post('/destination', (req, res) => {
    const { elevatorId, floor } = req.body;
    if (typeof elevatorId !== 'number' || typeof floor !== 'number') {
        return res.status(400).json({ 
          error: 'Invalid request parameters',
          details: {
            expected: { elevatorId: 'number', floor: 'number' },
            received: req.body
          }
        });
    }
    simulationService.addDestinationRequest(elevatorId, floor);
    res.json({ success: true });
});

// Report Generation
app.get('/report', (req, res) => {
  try {
    const report = ReportService.generateReport(simulationService.getState());
    res.set('Content-Type', 'text/markdown');
    res.send(report);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate report',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});

export default app; // For testing purposes
