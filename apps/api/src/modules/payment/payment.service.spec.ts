import { Test, TestingModule } from '@nestjs/testing';

import { DrizzleService } from '../../database/drizzle/drizzle.service';
import { TransactionMethod, TransactionStatus } from '../user_transaction/dto/create-user-transaction.dto';
import { UserTransactionService } from '../user_transaction/user-transaction.service';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let userTransactionService: UserTransactionService;
  let drizzleService: DrizzleService;

  const mockUserTransactionService = {
    create: jest.fn(),
  };

  const mockDrizzleService = {
    db: {
      transaction: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: UserTransactionService,
          useValue: mockUserTransactionService,
        },
        {
          provide: DrizzleService,
          useValue: mockDrizzleService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    userTransactionService = module.get<UserTransactionService>(UserTransactionService);
    drizzleService = module.get<DrizzleService>(DrizzleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processPayment', () => {
    it('should create transaction for cash payment with success status', async () => {
      const paymentRequest = {
        userId: 'user-123',
        orderId: 'order-123',
        amount: '100000',
        method: TransactionMethod.CASH,
        status: TransactionStatus.SUCCESS,
        transTime: '2024-01-01T00:00:00.000Z',
        description: 'Thanh toán tiền mặt',
      };

      const mockTransaction = { id: 'transaction-123' };
      const mockTrx = { insert: jest.fn() };

      mockDrizzleService.db.transaction.mockImplementation(async (callback: any) => {
        return await callback(mockTrx);
      });
      mockUserTransactionService.create.mockResolvedValue(mockTransaction);

      const result = await service.processPayment(paymentRequest);

      expect(mockDrizzleService.db.transaction).toHaveBeenCalled();
      expect(mockUserTransactionService.create).toHaveBeenCalledWith(paymentRequest, mockTrx);
      expect(result).toEqual(mockTransaction);
    });

    it('should return pending message for zalopay payment', async () => {
      const paymentRequest = {
        userId: 'user-123',
        orderId: 'order-123',
        amount: '100000',
        method: TransactionMethod.ZALOPAY,
        status: TransactionStatus.PENDING,
        transTime: '2024-01-01T00:00:00.000Z',
        description: 'Thanh toán ZaloPay',
      };

      const result = await service.processPayment(paymentRequest);

      expect(result).toEqual({
        message: 'ZaloPay transaction will be created upon successful callback.',
        status: 'pending',
        method: TransactionMethod.ZALOPAY,
      });
    });

    it('should throw error for unsupported payment method', async () => {
      const paymentRequest = {
        userId: 'user-123',
        orderId: 'order-123',
        amount: '100000',
        method: 'invalid' as TransactionMethod,
        status: TransactionStatus.SUCCESS,
        transTime: '2024-01-01T00:00:00.000Z',
        description: 'Invalid payment',
      };

      await expect(service.processPayment(paymentRequest)).rejects.toThrow('Unsupported payment method: invalid with status: success');
    });
  });

  describe('createZaloPayTransaction', () => {
    it('should create ZaloPay transaction with transaction wrapper', async () => {
      const callbackData = {
        userId: 'user-123',
        orderId: 'order-123',
        amount: '100000',
        transTime: '2024-01-01T00:00:00.000Z',
        transactionCode: 'zp-123',
        orderNumber: 'ORD-001',
      };

      const mockTransaction = { id: 'transaction-123' };
      const mockTrx = { insert: jest.fn() };

      mockDrizzleService.db.transaction.mockImplementation(async (callback: any) => {
        return await callback(mockTrx);
      });
      mockUserTransactionService.create.mockResolvedValue(mockTransaction);

      const result = await service.createZaloPayTransaction(callbackData);

      expect(mockDrizzleService.db.transaction).toHaveBeenCalled();
      expect(mockUserTransactionService.create).toHaveBeenCalledWith(
        {
          userId: callbackData.userId,
          orderId: callbackData.orderId,
          amount: String(callbackData.amount),
          method: TransactionMethod.ZALOPAY,
          status: TransactionStatus.SUCCESS,
          transTime: callbackData.transTime,
          transactionCode: callbackData.transactionCode,
          description: `Thanh toán đơn hàng #${callbackData.orderNumber}`,
        },
        mockTrx,
      );
      expect(result).toEqual(mockTransaction);
    });
  });
});
