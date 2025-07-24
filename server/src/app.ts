// @ts-ignore - Temporary workaround for AbortSignal conflict
import express, { Request, Response } from 'express';
// @ts-ignore - Temporary workaround for AbortSignal conflict
import cors, { CorsOptions } from 'cors';
import { SimulationService } from './services/SimulationService';
import { SimulationConfig } from './models/Elevator';
import { ReportService } from './services/ReportService';

// Type declarations to resolve AbortSignal conflict
declare global {
  interface AbortSignal {
    timeout(milliseconds: number): AbortSignal;
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration with proper typing
const allowedOrigins = [
  'http://localhost:3000',
  'https://elevator-frontend.onrender.com'
];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
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
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy',
    version: '1.0.0'
  });
});

// Simulation Endpoints
app.get('/state', (req: Request, res: Response) => {
    res.json(simulationService.getState());
});

app.post('/config', (req: Request, res: Response) => {
    const newConfig = { ...defaultConfig, ...req.body };
    simulationService.updateConfig(newConfig);
    res.json({ success: true });
});

app.post('/start', (req: Request, res: Response) => {
    simulationService.startSimulation();
    res.json({ success: true });
});

app.post('/stop', (req: Request, res: Response) => {
    simulationService.stopSimulation();
    res.json({ success: true });
});

app.post('/reset', (req: Request, res: Response) => {
    const config = req.body.config || defaultConfig;
    simulationService = new SimulationService(config);
    res.json({ success: true });
});

// Request Handling
app.post('/request', (req: Request, res: Response) => {
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

app.post('/destination', (req: Request, res: Response) => {
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
app.get('/report', (req: Request, res: Response) => {
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
export default app; 
