//This class is used to detect and display error messages.
//Also displays the status code of error.

class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}



module.exports = ExpressError;