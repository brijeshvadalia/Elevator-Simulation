import React from 'react';
import { Direction } from '../types/elevator';
import './FloorPanel.css';

interface FloorPanelProps {
    floor: number;
    hasUpRequest: boolean;
    hasDownRequest: boolean;
    onRequest: (direction: Direction) => void;
}

const FloorPanel: React.FC<FloorPanelProps> = ({ 
    floor, 
    hasUpRequest, 
    hasDownRequest,
    onRequest 
}) => {
    return (
        <div className="floor-panel">
            <div className="floor-number">{floor}</div>
            <div className="call-buttons">
                <button 
                    className={`up ${hasUpRequest ? 'active' : ''}`}
                    onClick={() => onRequest(Direction.UP)}
                >
                    ↑
                </button>
                <button 
                    className={`down ${hasDownRequest ? 'active' : ''}`}
                    onClick={() => onRequest(Direction.DOWN)}
                >
                    ↓
                </button>
            </div>
        </div>
    );
};

export default FloorPanel;