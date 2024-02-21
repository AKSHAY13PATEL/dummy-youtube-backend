import ApiResponse from "./ApiResponse.js";

class ApiError extends Error {
  constructor(res, status_code, message, error) {
    super(message);
    this.status_code = status_code;
    this.error = error;

    new ApiResponse(res, false, status_code, message, error, null);
  }
}

export default ApiError;
