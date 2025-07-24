export enum Direction {
    UP = 'UP',
    DOWN = 'DOWN',
    IDLE = 'IDLE'
}

export enum DoorState {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    OPENING = 'OPENING',
    CLOSING = 'CLOSING'
}

export interface ElevatorState {
    id: number;
    currentFloor: number;
    direction: Direction;
    doorState: DoorState;
    destinationFloors: number[];
    passengers: number;
}

export interface FloorRequest {
    floor: number;
    direction: Direction;
    timestamp: number;
}

export interface DestinationRequest {
    elevatorId: number;
    floor: number;
    timestamp: number;
}

export interface SimulationConfig {
    numberOfFloors: number;
    numberOfElevators: number;
    requestFrequency: number;
    simulationSpeed: number;
    morningPeak: boolean;
    eveningPeak: boolean;
    elevatorCapacity: number;
}

export interface SimulationState {
    elevators: ElevatorState[];
    floorRequests: FloorRequest[];
    destinationRequests: DestinationRequest[];
    config: SimulationConfig;
}
