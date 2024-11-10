import mongoose from "mongoose";

const qrSchema = new mongoose.Schema({
    userId:
    {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    qrId:
    {
        type: String,
        unique: true,
        required: true,
    },
    validTill:
    {
        type: Date,
    },
    visitorCount:
    {
        type: Number,
        default: 0,
    }
},{timestamps: true});

export const QR = mongoose.model(qrSchema,"QR");