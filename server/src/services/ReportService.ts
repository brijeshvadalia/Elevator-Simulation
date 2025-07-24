import { SimulationState } from '../models/Elevator';

export class ReportService {
  static generateReport(state: SimulationState): string {
    const metrics = this.calculateMetrics(state);
    return `
# Elevator Simulation Report
## Performance Metrics
- **Active Requests**: ${metrics.activeRequests}
- **Active Elevators**: ${metrics.activeElevators} / ${state.elevators.length}
- **Average Wait Time**: ${metrics.avgWaitTime}s
- **Elevator Utilization**: ${metrics.utilization}%

## System Status
- **Current Floor Requests**: ${metrics.floorRequests}
- **Pending Destinations**: ${metrics.destinationRequests}
- **Simulation Speed**: ${state.config.simulationSpeed}x
- **Request Frequency**: ${state.config.requestFrequency}/sec

## Configuration
- **Floors**: ${state.config.numberOfFloors}
- **Elevators**: ${state.config.numberOfElevators}
- **Capacity**: ${state.config.elevatorCapacity} persons/elevator
- **Traffic Pattern**: ${state.config.morningPeak ? 'Morning Peak' : state.config.eveningPeak ? 'Evening Peak' : 'Normal'}
    `;
  }

  private static calculateMetrics(state: SimulationState) {
    const now = Date.now();
    const waitTimes = state.floorRequests.map(req => (now - req.timestamp) / 1000);
    const avgWaitTime = waitTimes.length > 0 
      ? (waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
      : 0;

    const activeElevators = state.elevators.filter(e => 
      e.direction !== 'IDLE' || e.destinationFloors.length > 0
    ).length;

    return {
      activeRequests: state.floorRequests.length,
      activeElevators,
      avgWaitTime: avgWaitTime.toFixed(1),
      utilization: Math.round((activeElevators / state.elevators.length) * 100),
      floorRequests: state.floorRequests.length,
      destinationRequests: state.destinationRequests.length
    };
}
}