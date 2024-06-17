/**
 * ? An error class that includes an HTTP status code and a status message.
 * ? The uses of this class is to create more informative operational errors.
 */

class ApiError extends Error {
    constructor(message, statusCode) {
      /**
       * Create a new instance of ApiError.
       * @param {string} message - The error message.
       * @param {number} statusCode - The HTTP status code for the error.
       */
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith("4") ? "Failure" : "Error";
    }
  }
  
  module.exports = ApiError;