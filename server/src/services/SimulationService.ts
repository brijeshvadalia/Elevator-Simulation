import { SimulationState, SimulationConfig, ElevatorState, Direction, DoorState, FloorRequest, DestinationRequest } from '../models/Elevator';
import { Scheduler } from '../algorithms/Scheduler';

export class SimulationService {
    private state: SimulationState;
    private requestInterval: NodeJS.Timeout | null = null;
    private moveInterval: NodeJS.Timeout | null = null;
    private lastRequestTime = 0;

    constructor(config: SimulationConfig) {
        this.state = this.initializeState(config);
    }

    private initializeState(config: SimulationConfig): SimulationState {
        const elevators: ElevatorState[] = [];
        for (let i = 0; i < config.numberOfElevators; i++) {
            elevators.push({
                id: i,
                currentFloor: 0,
                direction: Direction.IDLE,
                doorState: DoorState.CLOSED,
                destinationFloors: [],
                passengers: 0
            });
        }

        return {
            elevators,
            floorRequests: [],
            destinationRequests: [],
            config
        };
    }

    startSimulation(): void {
        this.stopSimulation(); // Ensure no existing intervals

        // Generate requests periodically
        this.requestInterval = setInterval(() => {
            this.generateRandomRequest();
        }, 1000 / this.state.config.requestFrequency);

        // Move elevators periodically based on simulation speed
        this.moveInterval = setInterval(() => {
            this.moveElevators();
        }, 1000 / this.state.config.simulationSpeed);
    }

    stopSimulation(): void {
        if (this.requestInterval) clearInterval(this.requestInterval);
        if (this.moveInterval) clearInterval(this.moveInterval);
        this.requestInterval = null;
        this.moveInterval = null;
    }

    resetSimulation(config: SimulationConfig): void {
        this.stopSimulation();
        this.state = this.initializeState(config);
    }

    updateConfig(config: Partial<SimulationConfig>): void {
        this.state.config = { ...this.state.config, ...config };
    }

    getState(): SimulationState {
        return JSON.parse(JSON.stringify(this.state));
    }

    addFloorRequest(floor: number, direction: Direction): void {
        this.state.floorRequests.push({
            floor,
            direction,
            timestamp: Date.now()
        });
    }

    addDestinationRequest(elevatorId: number, floor: number): void {
        this.state.destinationRequests.push({
            elevatorId,
            floor,
            timestamp: Date.now()
        });
    }

    private generateRandomRequest(): void {
        const now = Date.now();
        if (now - this.lastRequestTime < 1000 / this.state.config.requestFrequency) return;
        this.lastRequestTime = now;

        const { numberOfFloors, morningPeak, eveningPeak } = this.state.config;
        let originFloor: number;
        let destinationFloor: number;

        // Morning peak - 70% of requests start at lobby going up
        if (morningPeak && Math.random() < 0.7) {
            originFloor = 0;
            destinationFloor = Math.floor(Math.random() * (numberOfFloors - 1)) + 1;
            this.addFloorRequest(originFloor, Direction.UP);
            return;
        }

        // Evening peak - 60% of requests are going down to lobby
        if (eveningPeak && Math.random() < 0.6) {
            originFloor = Math.floor(Math.random() * (numberOfFloors - 1)) + 1;
            destinationFloor = 0;
            this.addFloorRequest(originFloor, Direction.DOWN);
            return;
        }

        // Normal operation - random requests
        originFloor = Math.floor(Math.random() * numberOfFloors);
        do {
            destinationFloor = Math.floor(Math.random() * numberOfFloors);
        } while (destinationFloor === originFloor);

        const direction = destinationFloor > originFloor ? Direction.UP : Direction.DOWN;
        this.addFloorRequest(originFloor, direction);
    }

    private moveElevators(): void {
        const scheduler = new Scheduler(this.state);
        this.state = scheduler.assignRequests();

        for (const elevator of this.state.elevators) {
            this.moveSingleElevator(elevator);
        }
    }

    private moveSingleElevator(elevator: ElevatorState): void {
        // Handle door states
        if (elevator.doorState === DoorState.OPEN) {
            // Stay open for 2 seconds
            if (Date.now() - (elevator as any).doorOpenTime > 2000) {
                elevator.doorState = DoorState.CLOSING;
                (elevator as any).doorOpenTime = null;
            }
            return;
        }

        if (elevator.doorState === DoorState.OPENING || elevator.doorState === DoorState.CLOSING) {
            // Transition takes 1 second
            if (!(elevator as any).doorTransitionStart) {
                (elevator as any).doorTransitionStart = Date.now();
            } else if (Date.now() - (elevator as any).doorTransitionStart > 1000) {
                elevator.doorState = elevator.doorState === DoorState.OPENING ? DoorState.OPEN : DoorState.CLOSED;
                (elevator as any).doorTransitionStart = null;
                if (elevator.doorState === DoorState.OPEN) {
                    (elevator as any).doorOpenTime = Date.now();
                    // Handle passenger boarding/alighting
                    this.handlePassengerExchange(elevator);
                }
            }
            return;
        }

        // Elevator is moving or idle
        if (elevator.destinationFloors.length === 0) {
            elevator.direction = Direction.IDLE;
            return;
        }

        const nextFloor = elevator.destinationFloors[0];
        if (nextFloor === elevator.currentFloor) {
            // Reached destination - open doors
            elevator.destinationFloors.shift();
            elevator.doorState = DoorState.OPENING;
            (elevator as any).doorTransitionStart = Date.now();
            return;
        }

        // Move toward destination
        elevator.direction = nextFloor > elevator.currentFloor ? Direction.UP : Direction.DOWN;
        elevator.currentFloor += elevator.direction === Direction.UP ? 1 : -1;
    }

    private handlePassengerExchange(elevator: ElevatorState): void {
        // Randomly determine how many passengers get on/off
        const passengersLeaving = Math.min(
            elevator.passengers,
            Math.floor(Math.random() * 4) // 0-3 passengers leave
        );
        elevator.passengers -= passengersLeaving;

        const passengersEntering = Math.min(
            this.state.config.elevatorCapacity - elevator.passengers,
            Math.floor(Math.random() * 4) // 0-3 passengers enter
        );
        elevator.passengers += passengersEntering;
    }
}