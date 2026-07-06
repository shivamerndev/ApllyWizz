import { AppError } from "../utils/error.utils.js";


/**
 * Middleware to validate provided data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

export const validator = (provideSchema) => (req, res, next) => {

    const result = provideSchema.safeParse(req.body);
console.log(result)
    if (!result.success) throw new AppError(400, "Validation Error", result.error.flatten());

    req.body = result.data;
    next()
}
