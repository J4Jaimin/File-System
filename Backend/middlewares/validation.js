import { ObjectId } from "mongodb";

export const validateObjectId = (req, res, next, id) => {

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "Invalid id format."
        });
    }

    next();
}