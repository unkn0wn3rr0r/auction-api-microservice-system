type MonitorStatus = 'ok' | 'fail';
type DatabaseDetails = 'up' | 'down';

export interface MonitorStatusResponse {
    status: MonitorStatus;
    details: {
        db: DatabaseDetails;
    };
}
