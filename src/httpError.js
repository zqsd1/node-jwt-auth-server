export class HttpError extends Error {
    /**
     * 
     * @param {number} statusCode http statuscode error
     * @param {string} message 
     */
    constructor(statusCode, message = "something wrong") {
        super(message)
        this.statusCode = statusCode
        this.isOperational = true
    }


}