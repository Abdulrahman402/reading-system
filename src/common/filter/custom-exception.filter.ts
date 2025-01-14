// src/common/exceptions/custom.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(message: string, error?: string) {
    console.error(error); // Log the error message
    super(message, HttpStatus.BAD_REQUEST);
  }
}
