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

describe('POST /invoices/{invoiceId}/adjustments (addInvoiceAdjustment)', () => {
  let app: NestExpressApplication;
  let request: any;
  const operationId = 'addInvoiceAdjustment';
  const invoiceId = '00000000-0000-0000-0000-000000000001';

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    request = testApp.request;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Contract definition', () => {
    it('should define addInvoiceAdjustment operation', () => {
      const op = getOperation(operationId);
      expect(op).not.toBeNull();
      expect(op!.method).toBe('POST');
      expect(op!.path).toBe('/invoices/{invoiceId}/adjustments');
    });

    it('should expect 201 status code', () => {
      expect(getExpectedStatuses(operationId)).toEqual([201]);
    });

    it('should have InvoiceAdjustmentRequest with 3 required fields', () => {
      const spec = loadContract();
      const schemas = (spec.components as Record<string, unknown>).schemas as Record<string, unknown>;
      const reqSchema = schemas.InvoiceAdjustmentRequest as Record<string, unknown>;
      expect(reqSchema).toBeDefined();
      const required = reqSchema.required as string[];
      expect(required).toContain('adjustmentType');
      expect(required).toContain('amount');
      expect(required).toContain('reason');
    });
  });

  describe('Request schema validation', () => {
    it('should validate valid InvoiceAdjustmentRequest (credit)', () => {
      const spec = loadContract();
      const schemas = (spec.components as Record<string, unknown>).schemas as Record<string, unknown>;
      const result = validateResponseBody(schemas.InvoiceAdjustmentRequest as Record<string, unknown>, {
        adjustmentType: 'credit',
        amount: 50.00,
        reason: 'Customer discount',
      });
      expect(result.valid).toBe(true);
    });

    it('should validate debit adjustmentType', () => {
      const spec = loadContract();
      const schemas = (spec.components as Record<string, unknown>).schemas as Record<string, unknown>;
      const result = validateResponseBody(schemas.InvoiceAdjustmentRequest as Record<string, unknown>, {
        adjustmentType: 'debit',
        amount: 25.50,
        reason: 'Late fee',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject invalid adjustmentType', () => {
      const spec = loadContract();
      const schemas = (spec.components as Record<string, unknown>).schemas as Record<string, unknown>;
      const result = validateResponseBody(schemas.InvoiceAdjustmentRequest as Record<string, unknown>, {
        adjustmentType: 'refund',
        amount: 10,
        reason: 'test',
      });
      expect(result.valid).toBe(false);
    });

    it('should reject missing required fields', () => {
      const spec = loadContract();
      const schemas = (spec.components as Record<string, unknown>).schemas as Record<string, unknown>;
      const result = validateResponseBody(schemas.InvoiceAdjustmentRequest as Record<string, unknown>, {});
      expect(result.valid).toBe(false);
    });
  });

  describe('HTTP endpoint (TDD)', () => {
    it('should return a valid status code', async () => {
      const res = await request.post(`/api/v1/invoices/${invoiceId}/adjustments`).send({
        adjustmentType: 'credit',
        amount: 50.00,
        reason: 'Customer discount',
      });
      expect(validateStatus(operationId, res.status)).toBe(true);
    });
  });
});
