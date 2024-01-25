const asyncHandler = (requestHandler) => async (req, res, next) => {
    try {
        await requestHandler(req, res, next)
    } catch (error) {
        res.status(error.code || 400).json({
            success: false,
            message: error.message
        })
    }
}
const asyncHandler2 = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).reject((err) => next(err))
    }
}
export { asyncHandler }