import express from "express";
import * as sellerController from "../controllers/sellerController.js";
import SellerAuthVerify from "../middleware/SellerMiddleware.js";

const router = express.Router();

// seller api's
router.post("/:sellerID/ads", SellerAuthVerify, sellerController.createAdsPost);
router.get(
  "/:sellerID/ads",
  SellerAuthVerify,
  sellerController.getAdsPostByUser,
);

export default router;
