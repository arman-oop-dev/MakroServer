import express from "express";
import * as adminController from "../controllers/adminControler.js";
import * as buyerController from "../controllers/buyerController.js";
import * as sellerController from "../controllers/sellerController.js";
import AdminAuthVerify from "../middleware/AdminMiddleware.js";
import SellerAuthVerify from "../middleware/SellerMiddleware.js";

const router = express.Router();

// admin api's
router.get("/ads/:adminID", AdminAuthVerify, adminController.getPendingAds);

router.patch(
  "/:adminID/ads/:adsID/status",
  AdminAuthVerify,
  adminController.updateAdStatus,
);

// seller api's
router.post("/:sellerID/ads", SellerAuthVerify, sellerController.createAdsPost);
router.get(
  "/:sellerID/ads",
  SellerAuthVerify,
  sellerController.getAdsPostByUser,
);

router.patch("/updateAds/:id", SellerAuthVerify, sellerController.updateAds)

// buyer api's
router.get("/ads", buyerController.getAllAds);


export default router;

