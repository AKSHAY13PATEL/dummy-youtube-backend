class ApiResponse {
  constructor(res, success, status_code, message, error, data) {
    this.response = {
      success,
      message,
      error,
      data,
    };
    this.status_code = status_code;

    res.status(this.status_code).json(this.response);
  }
}

export default ApiResponse;
