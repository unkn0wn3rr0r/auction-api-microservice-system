import { Test, TestingModule } from '@nestjs/testing';
import { MonitorService } from 'src/core/services/monitor/monitor.service';
import { AuthTransportationService } from 'src/core/services/transport/auth.transportation.service';
import { AuctionRepository } from 'src/utils/models/auction';
import { MonitorStatusResponse } from 'src/utils/models/monitor';

describe('MonitorService', () => {
    let service: MonitorService;

    const mockAuthService = {
        isHealthy: jest.fn(),
    };
    const mockAuctionRepository = {
        isHealthy: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MonitorService,
                { provide: AuthTransportationService, useValue: mockAuthService },
                { provide: AuctionRepository, useValue: mockAuctionRepository },
            ],
        }).compile();

        service = module.get(MonitorService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return up for both auth and db when healthy', async () => {
        mockAuthService.isHealthy.mockResolvedValue(true);
        mockAuctionRepository.isHealthy.mockResolvedValue(true);

        const result: MonitorStatusResponse = await service.checkHealth();

        expect(result).toEqual({
            status: {
                auth: 'up',
                db: 'up',
            },
        });
    });

    it('should return down for auth when auth is unhealthy', async () => {
        mockAuthService.isHealthy.mockResolvedValue(false);
        mockAuctionRepository.isHealthy.mockResolvedValue(true);

        const result = await service.checkHealth();

        expect(result).toEqual({
            status: {
                auth: 'down',
                db: 'up',
            },
        });
    });

    it('should return down for db when db is unhealthy', async () => {
        mockAuthService.isHealthy.mockResolvedValue(true);
        mockAuctionRepository.isHealthy.mockResolvedValue(false);

        const result = await service.checkHealth();

        expect(result).toEqual({
            status: {
                auth: 'up',
                db: 'down',
            },
        });
    });

    it('should return down for both when both are unhealthy', async () => {
        mockAuthService.isHealthy.mockResolvedValue(false);
        mockAuctionRepository.isHealthy.mockResolvedValue(false);

        const result = await service.checkHealth();

        expect(result).toEqual({
            status: {
                auth: 'down',
                db: 'down',
            },
        });
    });
});
