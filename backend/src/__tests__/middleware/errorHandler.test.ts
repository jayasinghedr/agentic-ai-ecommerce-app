import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../middleware/errorHandler';

// Suppress console.error output produced by the errorHandler itself during tests
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('errorHandler middleware', () => {
  test('sends a 500 status with the error message', () => {
    const err = new Error('Something went wrong');
    const req = {} as Request;
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn() as NextFunction;

    errorHandler(err, req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal server error',
        message: 'Something went wrong',
      }),
    );
  });

  test('includes the original error message in the response body', () => {
    const err = new Error('DB connection timed out');
    const req = {} as Request;
    const jsonMock = jest.fn();
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jsonMock,
    };

    errorHandler(err, req, res as Response, jest.fn());

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'DB connection timed out' }),
    );
  });
});
