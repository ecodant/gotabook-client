export class HttpError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

/**
 * Status code: 401
 */
export class UnauthorizedError extends HttpError {

}
/**
 * Status code: 409
 */
export class ConflictError extends HttpError {

}
/**
 * Status code: 404
 */

export class NotFoundError extends HttpError { }
/**
 * Status code: 500
 */
export class InternalServerError extends HttpError { }