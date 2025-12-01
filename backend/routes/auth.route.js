import express from "express";
import { signup, signin, makeAdmin, verifyEmail, resendOTP } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/make-admin", makeAdmin);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);

export default router;
