export declare class ServerError extends Error {
    message: string;
    statusCode: number;
    constructor(message: string, statusCode: number);
}
