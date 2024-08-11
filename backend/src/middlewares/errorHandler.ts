import { Request, Response, NextFunction } from 'express';
import { ValidateError } from '@tsoa/runtime';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ValidateError) {
    return res.status(422).json({
      message: 'Validation Failed',
      errors: err.fields,
    });
  }

  if (err instanceof Error) {
    return res.status(500).json({
      message: err.message,
    });
  }

  next();
}
