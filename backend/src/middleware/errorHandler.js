import { errorResponse, HTTP_STATUS } from '../utils/apiResponse.js';

const globalErrorHandler = (err, req, res, next) => {
    console.error('Error Log:', err);

    // 1. Handle Supabase/Postgres specific errors
    // Code '23505' is a unique constraint violation (e.g., duplicate email or username)
    if (err.code === '23505') {
        return errorResponse(res, 'This record already exists.', HTTP_STATUS.BAD_REQUEST);
    }

    // Code '23503' is a foreign key violation (e.g., referencing a user that doesn't exist)
    if (err.code === '23503') {
        return errorResponse(res, 'Invalid reference to another record.', HTTP_STATUS.BAD_REQUEST);
    }

    // 2. Handle known operational errors
    if (err.statusCode) {
        return errorResponse(res, err.message, err.statusCode);
    }

    // 3. Handle generic/unknown crashes (Mask the real error in production)
    return errorResponse(
        res,
        'Something went wrong. Please try again later.',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        err
    );
};

export default globalErrorHandler;