import React, { useEffect } from 'react';
import { useSimulation } from './hooks/useSimulation';
import ElevatorShaft from './components/ElevatorShaft';
import FloorPanel from './components/FloorPanel';
import ControlPanel from './components/ControlPanel';
import MetricsPanel from './components/MetricsPanel';
import { Direction } from './types/elevator';
import { ReportPanel } from './components/ReportPanel';
import './App.css';

const App: React.FC = () => {
    const {
        state,
        isRunning,
        error,
        startSimulation,
        stopSimulation,
        resetSimulation,
        updateConfig,
        addFloorRequest,
        addDestinationRequest,
        fetchState
    } = useSimulation();

    useEffect(() => {
        fetchState();
    }, [fetchState]);

    const generateReport = async (): Promise<string> => {
        try {
            const response = await fetch('http://localhost:3001/report');
            if (!response.ok) {
                throw new Error('Failed to generate report');
            }
            return await response.text();
        } catch (err) {
            console.error('Report generation error:', err);
            return `# Error Generating Report\n${err instanceof Error ? err.message : String(err)}`;
        }
    };

    if (!state) {
        return <div className="loading">Loading simulation...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="app">
            <header className="header">
                <h1>Elevator System Simulation</h1>
                <div className="simulation-status">
                    <span className={`status-indicator ${isRunning ? 'active' : ''}`}>
                        {isRunning ? 'SIMULATION RUNNING' : 'PAUSED'}
                    </span>
                </div>
            </header>

            <div className="main-grid">
                <div className="building-container">
                    <div className="building">
                        <div className="floor-panels">
                            {Array.from({ length: state.config.numberOfFloors }, (_, i) => {
                                const floor = state.config.numberOfFloors - 1 - i;
                                const hasUpRequest = state.floorRequests.some(
                                    req => req.floor === floor && req.direction === Direction.UP
                                );
                                const hasDownRequest = state.floorRequests.some(
                                    req => req.floor === floor && req.direction === Direction.DOWN
                                );
                                
                                return (
                                    <FloorPanel
                                        key={floor}
                                        floor={floor}
                                        hasUpRequest={hasUpRequest}
                                        hasDownRequest={hasDownRequest}
                                        onRequest={(direction) => addFloorRequest(floor, direction)}
                                    />
                                );
                            })}
                        </div>

                        <div className="elevator-shafts">
                            {state.elevators.map(elevator => (
                                <ElevatorShaft
                                    key={elevator.id}
                                    elevator={elevator}
                                    numberOfFloors={state.config.numberOfFloors}
                                    onDestinationRequest={(floor) => addDestinationRequest(elevator.id, floor)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="control-container">
                    <ControlPanel
                        config={state.config}
                        isRunning={isRunning}
                        onStart={startSimulation}
                        onStop={stopSimulation}
                        onReset={resetSimulation}
                        onConfigChange={updateConfig}
                    />
                    <MetricsPanel state={state} />
                    <ReportPanel onGenerate={generateReport} />
                </div>
            </div>
        </div>
    );
};

export default App;