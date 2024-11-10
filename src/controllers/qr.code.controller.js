import mongoose from "mongoose";
import {User} from "../models/user.model.js";
import { QR } from "../models/qr.model.js";
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateQRCode = asyncHandler(async (req,res) => {
    try
    {
        const id = req?.user?._id;
        const {validTill} = req.body;
        if(!id)
        {
            return res.status(400).json(new ApiResponse(400,{},"All fields are required"));
        }

        const user = await User.findById(id);
        if(!user)
        {
            return res.status(400).json(new ApiResponse(400,{},"User does not exist"));
        }

        const qrId = uuidv4();
        const qrDetails = {
            id,
            qrId,
            validTill,
        }

        const qrCode = await QR.create(qrDetails);

        return res.status(200).json(new ApiResponse(200,qrCode,"QR Code Created Successfully"));
    }
    catch(e)
    {
        return res.status(500).json(new ApiResponse(500,{},"Error while creating QR code"));
    }
});

const getQRCodeDetails = asyncHandler(async (req,res) => {
    try
    {
        const {qrId} = req.body;
        if(!qrId)
        {
            return res.status(400).json(new ApiResponse(400,{},"All fields are required"));
        }

        const qrDetails = await QR.findById(new mongoose.Types.ObjectId(qrId));
        if(!qrDetails)
        {
            return res.status(500).json(new ApiResponse(500,{},"Error while fetching qr details"));
        }

        return res.status(200).json(new ApiResponse(200,qrDetails,"QR details fetched successfully"));
    }
    catch(e)
    {
        return res.status(500).json(new ApiResponse(500,{},"Error while fetching QR details"));
    }
})

export {generateQRCode, getQRCodeDetails};