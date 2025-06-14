export class HttpError extends Error {
    /**
     * 
     * @param {number} statusCode http statuscode error
     * @param {string} message 
     */
    constructor(statusCode = 500, message = "something wrong", data = {}) {
        super(message)
        this.statusCode = statusCode
        this.data = data
        this.isOperational = true
    }


}