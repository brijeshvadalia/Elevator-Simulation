import { useState, useEffect } from 'react';
import { Direction, SimulationState, SimulationConfig } from '../types/elevator';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const useSimulation = () => {
    const [state, setState] = useState<SimulationState | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchState = async () => {
        try {
            const response = await fetch(`${API_URL}/state`);
            const data = await response.json();
            setState(data);
        } catch (err) {
            setError('Failed to fetch simulation state');
            console.error(err);
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchState, 1000);
        return () => clearInterval(interval);
    }, []);

    const startSimulation = async () => {
        try {
            await fetch(`${API_URL}/start`, { method: 'POST' });
            setIsRunning(true);
        } catch (err) {
            setError('Failed to start simulation');
            console.error(err);
        }
    };

    const stopSimulation = async () => {
        try {
            await fetch(`${API_URL}/stop`, { method: 'POST' });
            setIsRunning(false);
        } catch (err) {
            setError('Failed to stop simulation');
            console.error(err);
        }
    };

    const resetSimulation = async (config: SimulationConfig) => {
        try {
            await fetch(`${API_URL}/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config })
            });
            setIsRunning(false);
            fetchState();
        } catch (err) {
            setError('Failed to reset simulation');
            console.error(err);
        }
    };

    const updateConfig = async (config: Partial<SimulationConfig>) => {
        try {
            await fetch(`${API_URL}/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            fetchState();
        } catch (err) {
            setError('Failed to update config');
            console.error(err);
        }
    };

    const addFloorRequest = async (floor: number, direction: Direction) => {
        try {
            await fetch(`${API_URL}/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ floor, direction })
            });
        } catch (err) {
            setError('Failed to add floor request');
            console.error(err);
        }
    };

    const addDestinationRequest = async (elevatorId: number, floor: number) => {
        try {
            await fetch(`${API_URL}/destination`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ elevatorId, floor })
            });
        } catch (err) {
            setError('Failed to add destination request');
            console.error(err);
        }
    };

    return {
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
    };
};
