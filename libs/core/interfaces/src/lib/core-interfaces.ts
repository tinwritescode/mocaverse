export class ServerError extends Error {
  constructor(override message: string, public statusCode: number) {
    super(message);
    this.name = 'ServerError';
  }
}
