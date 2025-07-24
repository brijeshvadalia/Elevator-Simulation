import express from 'express';
import cors from 'cors';
import { SimulationService } from './services/SimulationService';
import { SimulationConfig } from './models/Elevator';
import { ReportService } from './services/ReportService';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(cors({
  origin: CORS_ORIGIN
}));
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

app.post('/request', (req, res) => {
    const { floor, direction } = req.body;
    if (typeof floor !== 'number' || (direction !== 'UP' && direction !== 'DOWN')) {
        return res.status(400).json({ error: 'Invalid request parameters' });
    }
    simulationService.addFloorRequest(floor, direction);
    res.json({ success: true });
});

app.post('/destination', (req, res) => {
    const { elevatorId, floor } = req.body;
    if (typeof elevatorId !== 'number' || typeof floor !== 'number') {
        return res.status(400).json({ error: 'Invalid request parameters' });
    }
    simulationService.addDestinationRequest(elevatorId, floor);
    res.json({ success: true });
});

app.get('/report', (req, res) => {
  const report = ReportService.generateReport(simulationService.getState());
  res.set('Content-Type', 'text/markdown');
  res.send(report);
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
