import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
    qrId:
    {
        type: mongoose.Types.ObjectId,
        ref: "QR",
    },
    photoUrl:
    {
        type: String,
        required: true,
    },
    uploadedBy:
    {
        type: String,
        required: true,
        enum: ["Owner","Guest"],
        default: "Guest",
    }
});

export const Photo = mongoose.model("Photo",photoSchema);