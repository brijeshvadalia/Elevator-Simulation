import React from 'react';
import { ElevatorState , Direction } from '../types/elevator';
import './ElevatorShaft.css';

interface ElevatorShaftProps {
    elevator: ElevatorState;
    numberOfFloors: number;
    onDestinationRequest: (floor: number) => void;
}

const ElevatorShaft: React.FC<ElevatorShaftProps> = ({ 
    elevator, 
    numberOfFloors,
    onDestinationRequest
}) => {
    const floors = Array.from({ length: numberOfFloors }, (_, i) => numberOfFloors - 1 - i);

    return (
        <div className="elevator-shaft">
            <div className="floors">
                {floors.map(floor => (
                    <div key={floor} className="floor">
                        {elevator.currentFloor === floor && (
                            <div className={`elevator ${elevator.doorState.toLowerCase()}`}>
                                <div className="elevator-content">
                                    <div className="elevator-info">
                                        <span className="direction">
                                            {elevator.direction === Direction.UP ? '↑' : 
                                             elevator.direction === Direction.DOWN ? '↓' : ''}
                                        </span>
                                        <span className="passengers">{elevator.passengers}</span>
                                    </div>
                                    <div className="door left"></div>
                                    <div className="door right"></div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="destination-panel">
                <h4>Elevator {elevator.id + 1}</h4>
                <div className="destination-buttons">
                    {floors.map(floor => (
                        <button 
                            key={floor}
                            className={elevator.destinationFloors.includes(floor) ? 'active' : ''}
                            onClick={() => onDestinationRequest(floor)}
                        >
                            {floor}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ElevatorShaft;