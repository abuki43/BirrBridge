export class AppError extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

export class TransferError extends AppError {
  constructor(message: string) {
    super(message, 'TransferError');
  }
}

export class SwapError extends AppError {
  constructor(message: string) {
    super(message, 'SwapError');
  }
}

export class ArifpayError extends AppError {
  constructor(message: string) {
    super(message, 'ArifpayError');
  }
}
