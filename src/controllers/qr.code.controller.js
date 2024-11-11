import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { QR } from "../models/qr.model.js";
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Generate QR code
const generateQRCode = asyncHandler(async (req, res) => {
    const userId = req?.user?._id;
    const { validTill } = req.body;

    if (!userId || !validTill) {
        return res.status(400).json(new ApiResponse(400, {}, "All fields are required"));
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(new ApiResponse(404, {}, "User does not exist"));
    }

    const qrId = uuidv4();
    const qrCode = await QR.create({ userId, qrId, validTill });

    return res.status(201).json(new ApiResponse(201, qrCode, "QR Code Created Successfully"));
});

// Fetch QR code details
const getQRCodeDetails = asyncHandler(async (req, res) => {
    const { qrId } = req.body;

    if (!qrId) {
        return res.status(400).json(new ApiResponse(400, {}, "QR ID is required"));
    }

    const qrDetails = await QR.findById(mongoose.Types.ObjectId(qrId));
    if (!qrDetails) {
        return res.status(404).json(new ApiResponse(404, {}, "QR code not found"));
    }

    return res.status(200).json(new ApiResponse(200, qrDetails, "QR details fetched successfully"));
});

// Validate QR code
const validateQRCode = asyncHandler(async (req, res) => {
    const { qrId } = req.params;

    if (!qrId) {
        return res.status(400).json(new ApiResponse(400, {}, "QR ID is required"));
    }

    const qrDetails = await QR.findOne({ qrId });
    if (!qrDetails) {
        return res.status(404).json(new ApiResponse(404, {}, "QR code not found"));
    }

    const isValid = new Date(qrDetails.validTill) > new Date();
    if (!isValid) {
        return res.status(410).json(new ApiResponse(410, {}, "QR code has expired"));
    }

    return res.status(200).json(new ApiResponse(200, qrDetails, "QR code is valid"));
});

export { generateQRCode, getQRCodeDetails, validateQRCode };