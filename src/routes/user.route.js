import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    searchUsersByUsername,
} from "../controllers/user.controller.js";

const router = Router();
router.route("/registerUser").post(
    upload.fields([
        // name should be same in frontend also
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshToken").get(verifyJWT, refreshAccessToken);
router.route("/changePassword").patch(verifyJWT, changeCurrentPassword);
router.route("/getUser").get(verifyJWT, getCurrentUser);
router.route("/updateAccountDetails").patch(verifyJWT, updateAccountDetails);
router
    .route("/updateUserAvatar")
    .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.patch(
    "/updateCoverImage",
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
);

router.route("/getUserByName/:username").get(searchUsersByUsername);

export default router;