
export default (req, res, next) => {

    res.success = (statusCode = 200, message, data) => {
        res.status(statusCode).json({
            success: true,
            message,
            data
        });
    };
    next();
}