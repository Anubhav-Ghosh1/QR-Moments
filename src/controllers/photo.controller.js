import {Photo} from "../models/photo.model.js";
import {User} from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { mailSender } from "../utils/mail.js";
import { uploadOnCloudinary } from "../utils/uploadToCloudinary.js";

const uploadPhoto = asyncHandler(async (req,res) => {
    try
    {
        const {qrId,uploadedBy} = req.body;
        if(!qrId)
        {
            return res.status(500).json(new ApiResponse(500,{},"All fields are required"));
        }

        const localFilePath = req?.file;
        if(!localFilePath)
        {
            return res.status(400).json(new ApiResponse(400,{},"File is required"));
        }

        const uploadedFile = await uploadOnCloudinary(localFilePath);
        if(!uploadedFile)
        {
            return res.status(500).json(new ApiResponse(500,{},"Error while uploading file"));
        }

        const photo = await Photo.create({
            qrId: new mongoose.Types.ObjectId(qrId),
            photoUrl: uploadedFile?.secure_url,
            uploadedBy: uploadedBy.length !== 0 ? uploadedBy : "Guest"
        });

        return res.status(200).json(new ApiResponse(200,photo,"File uploaded successfully"));
    }
    catch(e)
    {
        return res.status(500).json(new ApiResponse(500,{},"Error while uploading file"));
    }
});

const getPhotosForQRCode = asyncHandler(async (req,res) => {
    try
    {
        const {qrId} = req.body;

        if(!qrId)
        {
            return res.status(500).json(new ApiResponse(500,{},"All fields are required"));
        }

        // const qrDetails = QR.aggregate([
        //     {
        //         $match:
        //         {
        //             _id: new mongoose.Types.ObjectId(qrId)
        //         }
        //     },
        //     {
        //         $lookup:
        //         {
        //             foreignField: "qrId",
        //             localField: "_id",
        //             from: "photos",
        //             as: "photos"
        //         }
        //     }
        // ])
        const qrDetails = await QR.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(qrId),
                },
            },
            {
                $lookup: {
                    from: "photos", // collection name of photos
                    localField: "_id",
                    foreignField: "qrId",
                    as: "photos",
                },
            },
            {
                $lookup: {
                    from: "users", // collection name of users
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $unwind: "$userDetails", // Flatten user details to make it easier to access
            },
            {
                $project: {
                    qrId: 1,
                    validTill: 1,
                    visitorCount: 1,
                    photos: 1,
                    "userDetails.name": 1, // Include specific fields you need from the user
                    "userDetails.email": 1,
                },
            },
        ]);

        return res.status(200).json(new ApiResponse(200,qrDetails,"Details fetched successfully"));
    }
    catch(e)
    {
        return res.status(500).json(new ApiResponse(500,{},"Error while fetching data"));
    }
});

const sendPhoto = asyncHandler(async (req,res) => {
    try
    {
        const currentTime = new Date();

        // Step 1: Find expired QR codes
        const expiredQRCodes = await QR.find({ validTill: { $lt: currentTime } });
    
        // Step 2: Loop through each expired QR code
        for (const qrCode of expiredQRCodes) {
            // Retrieve associated photos
            const photos = await Photo.find({ qrId: qrCode._id });
    
            // Get the user who created the QR code
            const user = await User.findById(qrCode.userId);
    
            if (!user || photos.length === 0) continue; // Skip if user or photos are missing
    
            // Step 3: Prepare email content
            const photoUrls = photos.map(photo => `<img src="${photo.photoUrl}" alt="Photo"/>`).join("<br/>");
            const emailContent = `
                <h3>Hello ${user.name},</h3>
                <p>The photos uploaded by guests using your QR code (${qrCode.qrId}) are attached below:</p>
                ${photoUrls}
            `;
    
            // Step 4: Configure the email transport
            const transporter = nodemailer.createTransport({
                service: "gmail", // or your email provider
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
    
            // Step 5: Send the email
            await mailSender(user?.email,"Your QR Code Photos",emailContent);
    
            console.log(`Photos sent to user ${user.email} for QR code ${qrCode.qrId}`);
        }
    
        return res.status(200).json(new ApiResponse(200, {}, "Photos sent to users successfully"));
    }
    catch(e)
    {
        return res.status(500).json(new ApiResponse(500,{},"Error while sending photo"));
    }
})

export {uploadPhoto, getPhotosForQRCode, sendPhoto};