export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

export const successResponse = (res, data, message = 'Success', statusCode = HTTP_STATUS.OK) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...data,
    });
};

export const errorResponse = (res, message, statusCode = HTTP_STATUS.BAD_REQUEST, errorDetails = null) => {
    const response = {
        success: false,
        error: message,
    };

    // Only show raw error details in Development mode
    if (process.env.NODE_ENV === 'development' && errorDetails) {
        response.stack = errorDetails.message || errorDetails;
    }

    return res.status(statusCode).json(response);
};