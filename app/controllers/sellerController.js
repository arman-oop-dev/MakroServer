import mongoose from "mongoose";

import AdsPost from "../models/adsModel.js";

export const createAdsPost = async (req, res) => {
  try {
    const { title, description, price, rentType, image } = req.body;
    const sellerID = req.params.sellerID;
    const authSellerID = req.user?.id ?? req.user?.sub;

    if (
      !sellerID ||
      !authSellerID ||
      String(sellerID) !== String(authSellerID)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only create ads for your own seller account",
      });
    }

    const data = await AdsPost.create({
      title,
      description,
      price,
      rentType,
      image,
      sellerID: authSellerID,
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for submitting your ads.",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdsPostByUser = async (req, res) => {
  try {
    const { sellerID } = req.params;
    const authSellerID = req.user?.id ?? req.user?.sub;

    if (!mongoose.isValidObjectId(sellerID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
      });
    }

    if (!authSellerID || String(sellerID) !== String(authSellerID)) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own ads",
      });
    }

    const data = await AdsPost.find({ sellerID: authSellerID }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
