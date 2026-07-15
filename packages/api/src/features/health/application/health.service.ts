import { getHealthStatus } from "../domain/health.entity";

export class HealthService {
  check() {
    return getHealthStatus();
  }
}

export const healthService = new HealthService();
