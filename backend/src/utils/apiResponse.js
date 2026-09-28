/**
 * Standard API Response Utilities
 * Ensures consistent response format across all controllers
 */

export class ApiResponse {
  /**
   * Send a standard successful response
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {string} message
   * @param {any} data
   */
  static success(res, statusCode = 200, message = 'Request completed successfully', data = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send a standard paginated response
   * @param {import('express').Response} res
   * @param {Array<any>} data
   * @param {{ page: number, limit: number, total: number }} paginationOptions
   * @param {string} message
   */
  static paginated(res, data, { page = 1, limit = 20, total = 0 }, message = 'Data fetched successfully') {
    const totalPages = Math.ceil(total / limit) || 1;
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        totalPages,
      },
    });
  }

  /**
   * Send a 201 Created response
   */
  static created(res, message = 'Resource created successfully', data = {}) {
    return ApiResponse.success(res, 201, message, data);
  }

  /**
   * Send a 204 No Content response
   */
  static noContent(res) {
    return res.status(204).send();
  }
}
