import express from "express";
import * as sellerController from "../controllers/sellerController.js";
import SellerAuthVerify from "../middleware/SellerMiddleware.js";

const router = express.Router();

// seller api's
router.post("/:sellerID/ads", SellerAuthVerify, sellerController.createAdsPost);

export default router;
