
export const validateObjectId = (req, res, next, id) => {
    const objectIdRegex = /^[a-fA-F0-9]{24}$/;

    if (!objectIdRegex.test(id)) {
        return res.status(400).json({
            message: "Invalid id format."
        });
    }

    next();
}