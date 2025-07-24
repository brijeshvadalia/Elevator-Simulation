import React from 'react';
import { SimulationState } from '../types/elevator';
import './MetricsPanel.css';

interface MetricsPanelProps {
    state: SimulationState;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ state }) => {
    // Calculate metrics
    const activeRequests = state.floorRequests.length;
    const activeElevators = state.elevators.filter(e => 
        e.direction !== 'IDLE' || e.destinationFloors.length > 0
    ).length;

    // Calculate average wait time (simplified)
    const now = Date.now();
    const waitTimes = state.floorRequests.map(req => (now - req.timestamp) / 1000);
    const avgWaitTime = waitTimes.length > 0 
        ? (waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length).toFixed(1)
        : '0';

    return (
        <div className="metrics-panel">
            <h3>Simulation Metrics</h3>
            <div className="metric">
                <span className="label">Active Requests:</span>
                <span className="value">{activeRequests}</span>
            </div>
            <div className="metric">
                <span className="label">Active Elevators:</span>
                <span className="value">{activeElevators} / {state.elevators.length}</span>
            </div>
            <div className="metric">
                <span className="label">Avg Wait Time:</span>
                <span className="value">{avgWaitTime}s</span>
            </div>
            <div className="metric">
                <span className="label">Elevator Utilization:</span>
                <span className="value">
                    {Math.round((activeElevators / state.elevators.length) * 100)}%
                </span>
            </div>
        </div>
    );
};

export default MetricsPanel;