import { NestExpressApplication } from '@nestjs/platform-express';
import {
  createTestApp,
  loadContract,
  getOperation,
  getResponseSchema,
  validateResponseBody,
  validateStatus,
  getExpectedStatuses,
} from './setup';

jest.setTimeout(30000);

describe('GET /sim-cards/{simId}/eligibility (getSimEligibility)', () => {
  let app: NestExpressApplication;
  let request: any;
  const operationId = 'getSimEligibility';
  const simId = '00000000-0000-0000-0000-000000000001';

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    request = testApp.request;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Contract definition', () => {
    it('should define getSimEligibility operation in the spec', () => {
      const op = getOperation(operationId);
      expect(op).not.toBeNull();
      expect(op!.method).toBe('GET');
      expect(op!.path).toBe('/sim-cards/{simId}/eligibility');
    });

    it('should expect 200 status code', () => {
      const statuses = getExpectedStatuses(operationId);
      expect(statuses).toEqual([200]);
    });

    it('should have SimEligibility schema', () => {
      const spec = loadContract();
      const schemas = (spec.components as Record<string, unknown>).schemas as Record<string, unknown>;
      expect(schemas.SimEligibility).toBeDefined();
    });
  });

  describe('Response schema validation', () => {
    it('should validate 200 response as SimEligibility with all fields', () => {
      const schema = getResponseSchema(operationId, 200, true);
      expect(schema).not.toBeNull();
      const sample = {
        simId: '00000000-0000-0000-0000-000000000001',
        eligible: true,
        reason: 'Cooldown period expired',
        cooldownUntil: null,
      };
      const result = validateResponseBody(schema!, sample);
      expect(result.valid).toBe(true);
    });

    it('should validate SimEligibility with eligible false', () => {
      const schema = getResponseSchema(operationId, 200, true);
      expect(schema).not.toBeNull();
      const sample = {
        simId: '00000000-0000-0000-0000-000000000002',
        eligible: false,
        reason: 'SIM is in cooldown period',
        cooldownUntil: '2026-06-28T12:00:00.000Z',
      };
      const result = validateResponseBody(schema!, sample);
      expect(result.valid).toBe(true);
    });

    it('should validate SimEligibility without optional cooldownUntil', () => {
      const schema = getResponseSchema(operationId, 200, true);
      expect(schema).not.toBeNull();
      const sample = {
        simId: '00000000-0000-0000-0000-000000000003',
        eligible: true,
        reason: 'SIM is available',
      };
      const result = validateResponseBody(schema!, sample);
      expect(result.valid).toBe(true);
    });
  });

  describe('HTTP endpoint (TDD — expected to fail before T034)', () => {
    it('should return a valid status code for getSimEligibility', async () => {
      const res = await request.get(`/api/v1/sim-cards/${simId}/eligibility`);

      expect(validateStatus(operationId, res.status)).toBe(true);
    });
  });
});
