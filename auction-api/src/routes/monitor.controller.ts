import {
    Controller,
    Get,
} from '@nestjs/common';
import { MonitorStatusResponse } from 'src/models/monitor';
import { MonitorService } from 'src/services/monitor.service';

/*
    The idea behind this route is to check the health of the db and the app in general in the k8s cluster.
    It can be extended and improved of course, if there is such a need.
*/
@Controller('/monitor')
export class MonitorController {
    constructor(private readonly monitorService: MonitorService) { }

    @Get()
    async checkHealth(): Promise<MonitorStatusResponse> {
        const isDbHealthy = await this.monitorService.checkHealth();
        return {
            status: isDbHealthy ? 'ok' : 'fail',
            details: {
                db: isDbHealthy ? 'up' : 'down',
            },
        };
    }
}
