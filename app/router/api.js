import express from "express";
import * as adminController from "../controllers/adminControler.js";
import * as sellerController from "../controllers/sellerController.js";
import AdminAuthVerify from "../middleware/AdminMiddleware.js";
import SellerAuthVerify from "../middleware/SellerMiddleware.js";

const router = express.Router();

// seller api's
router.post("/:sellerID/ads", SellerAuthVerify, sellerController.createAdsPost);
router.get(
  "/:sellerID/ads",
  SellerAuthVerify,
  sellerController.getAdsPostByUser,
);

// admin api's
router.get("/ads/:adminID", AdminAuthVerify, adminController.getPendingAds);

router.patch(
  "/:adminID/ads/:adsID/status",
  AdminAuthVerify,
  adminController.updateAdStatus,
);

export default router;
