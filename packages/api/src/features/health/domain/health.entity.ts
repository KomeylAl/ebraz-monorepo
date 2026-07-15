export interface HealthStatus {
  status: "ok";
  service: "ebraz-api";
  version: string;
  timestamp: string;
}

export function getHealthStatus(): HealthStatus {
  return {
    status: "ok",
    service: "ebraz-api",
    version: "v1",
    timestamp: new Date().toISOString(),
  };
}
