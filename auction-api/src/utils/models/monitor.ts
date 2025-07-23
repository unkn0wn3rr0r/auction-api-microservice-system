type MonitorStatus = 'ok' | 'fail';
type MonitorDetails = 'up' | 'down';

export interface MonitorStatusResponse {
    status: MonitorStatus;
    details: {
        db: MonitorDetails;
    };
}
