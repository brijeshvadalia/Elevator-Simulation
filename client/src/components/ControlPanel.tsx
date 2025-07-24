import React, { useState } from 'react';
import { SimulationConfig } from '../types/elevator';
import './ControlPanel.css';

interface ControlPanelProps {
    config: SimulationConfig;
    isRunning: boolean;
    onStart: () => void;
    onStop: () => void;
    onReset: (config: SimulationConfig) => void;
    onConfigChange: (config: Partial<SimulationConfig>) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
    config, 
    isRunning,
    onStart, 
    onStop, 
    onReset,
    onConfigChange
}) => {
    const [localConfig, setLocalConfig] = useState<SimulationConfig>({ ...config });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalConfig(prev => ({
            ...prev,
            [name]: name.includes('Peak') ? value === 'true' : Number(value)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfigChange(localConfig);
    };

    return (
        <div className="control-panel">
            <h2>Simulation Controls</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Number of Floors:</label>
                    <input
                        type="number"
                        name="numberOfFloors"
                        min="2"
                        max="20"
                        value={localConfig.numberOfFloors}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label>Number of Elevators:</label>
                    <input
                        type="number"
                        name="numberOfElevators"
                        min="1"
                        max="8"
                        value={localConfig.numberOfElevators}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label>Request Frequency (reqs/sec):</label>
                    <input
                        type="number"
                        name="requestFrequency"
                        min="0.1"
                        max="2"
                        step="0.1"
                        value={localConfig.requestFrequency}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label>Simulation Speed:</label>
                    <select
                        name="simulationSpeed"
                        value={localConfig.simulationSpeed}
                        onChange={handleInputChange}
                    >
                        <option value="1">1x</option>
                        <option value="2">2x</option>
                        <option value="5">5x</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Elevator Capacity:</label>
                    <input
                        type="number"
                        name="elevatorCapacity"
                        min="1"
                        max="20"
                        value={localConfig.elevatorCapacity}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label>Traffic Pattern:</label>
                    <select
                        name="morningPeak"
                        value={String(localConfig.morningPeak)}
                        onChange={handleInputChange}
                    >
                        <option value="false">Normal</option>
                        <option value="true">Morning Peak</option>
                        <option value="false">Evening Peak</option>
                    </select>
                </div>

                <div className="button-group">
                    <button type="submit">Update Config</button>
                    {!isRunning ? (
                        <button type="button" onClick={onStart}>Start</button>
                    ) : (
                        <button type="button" onClick={onStop}>Stop</button>
                    )}
                    <button type="button" onClick={() => onReset(localConfig)}>Reset</button>
                </div>
            </form>
        </div>
    );
};

export default ControlPanel;