import { Direction, ElevatorState, FloorRequest, DestinationRequest, SimulationState } from '../models/Elevator';

export class Scheduler {
    private state: SimulationState;

    constructor(state: SimulationState) {
        this.state = state;
    }

    assignRequests(): SimulationState {
        const newState = JSON.parse(JSON.stringify(this.state)) as SimulationState;

        // Process floor requests (people waiting)
        this.processFloorRequests(newState);

        // Process destination requests (people inside elevators)
        this.processDestinationRequests(newState);

        return newState;
    }

    private processFloorRequests(state: SimulationState): void {
        const unassignedRequests: FloorRequest[] = [];

        for (const request of state.floorRequests) {
            const bestElevator = this.findBestElevatorForRequest(request, state.elevators);
            
            if (bestElevator) {
                // Add to elevator's destination list
                if (!bestElevator.destinationFloors.includes(request.floor)) {
                    bestElevator.destinationFloors.push(request.floor);
                    bestElevator.destinationFloors.sort((a, b) => 
                        bestElevator.direction === Direction.UP ? a - b : b - a
                    );
                }
            } else {
                unassignedRequests.push(request);
            }
        }

        state.floorRequests = unassignedRequests;
    }

    private processDestinationRequests(state: SimulationState): void {
        for (const request of state.destinationRequests) {
            const elevator = state.elevators.find(e => e.id === request.elevatorId);
            if (elevator && !elevator.destinationFloors.includes(request.floor)) {
                elevator.destinationFloors.push(request.floor);
                elevator.destinationFloors.sort((a, b) => 
                    elevator.direction === Direction.UP ? a - b : b - a
                );
            }
        }
    }

    private findBestElevatorForRequest(request: FloorRequest, elevators: ElevatorState[]): ElevatorState | null {
        const now = Date.now();
        const waitingTime = now - request.timestamp;
        const priorityThreshold = 30000; // 30 seconds

        // Filter out elevators that are full
        const availableElevators = elevators.filter(e => 
            e.passengers < this.state.config.elevatorCapacity
        );

        // Prioritize requests waiting too long
        if (waitingTime > priorityThreshold) {
            const closestElevator = this.findClosestIdleOrMovingToward(request, availableElevators);
            if (closestElevator) return closestElevator;
        }

        // Morning peak - prioritize lobby to upper floors
        if (this.state.config.morningPeak && request.floor === 0 && request.direction === Direction.UP) {
            const lobbyElevator = this.findBestLobbyElevator(request, availableElevators);
            if (lobbyElevator) return lobbyElevator;
        }

        // Evening peak - prioritize upper floors to lobby
        if (this.state.config.eveningPeak && request.floor > 0 && request.direction === Direction.DOWN) {
            const downElevator = this.findBestDownElevator(request, availableElevators);
            if (downElevator) return downElevator;
        }

        // Default logic - find closest suitable elevator
        return this.findClosestIdleOrMovingToward(request, availableElevators);
    }

    private findClosestIdleOrMovingToward(request: FloorRequest, elevators: ElevatorState[]): ElevatorState | null {
        let bestElevator: ElevatorState | null = null;
        let minDistance = Infinity;

        for (const elevator of elevators) {
            const distance = Math.abs(elevator.currentFloor - request.floor);
            const isMovingToward = 
                (elevator.direction === Direction.UP && elevator.currentFloor <= request.floor) ||
                (elevator.direction === Direction.DOWN && elevator.currentFloor >= request.floor);

            if (elevator.direction === Direction.IDLE || isMovingToward) {
                if (distance < minDistance) {
                    minDistance = distance;
                    bestElevator = elevator;
                }
            }
        }

        return bestElevator;
    }

    private findBestLobbyElevator(request: FloorRequest, elevators: ElevatorState[]): ElevatorState | null {
        // Prefer elevators already at lobby
        const atLobby = elevators.find(e => e.currentFloor === 0 && e.direction === Direction.IDLE);
        if (atLobby) return atLobby;

        // Then prefer elevators moving down toward lobby
        const movingDown = elevators.filter(e => e.direction === Direction.DOWN);
        if (movingDown.length > 0) {
            return movingDown.reduce((prev, curr) => 
                prev.currentFloor < curr.currentFloor ? prev : curr
            );
        }

        // Finally, any idle elevator
        return elevators.find(e => e.direction === Direction.IDLE) || null;
    }

    private findBestDownElevator(request: FloorRequest, elevators: ElevatorState[]): ElevatorState | null {
        // Prefer elevators already moving down above the request floor
        const movingDownAbove = elevators.filter(e => 
            e.direction === Direction.DOWN && e.currentFloor > request.floor
        );

        if (movingDownAbove.length > 0) {
            return movingDownAbove.reduce((prev, curr) => 
                Math.abs(prev.currentFloor - request.floor) < Math.abs(curr.currentFloor - request.floor) ? prev : curr
            );
        }

        // Then prefer idle elevators above the request floor
        const idleAbove = elevators.filter(e => 
            e.direction === Direction.IDLE && e.currentFloor > request.floor
        );

        if (idleAbove.length > 0) {
            return idleAbove.reduce((prev, curr) => 
                Math.abs(prev.currentFloor - request.floor) < Math.abs(curr.currentFloor - request.floor) ? prev : curr
            );
        }

        return null;
    }
}