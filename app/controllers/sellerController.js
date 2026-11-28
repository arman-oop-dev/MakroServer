import mongoose from "mongoose";

import AdsPost from "../models/adsModel.js";
import Payment from "../models/paymentModel.js";

const FREE_AD_LIMIT = 2;
const SELLER_PRO_PRODUCT = "seller_pro";

export const createAdsPost = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      rentType,
      location,
      quantity,
      image,
      status,
      terms_condition,
    } = req.body;
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

    if (!mongoose.isValidObjectId(authSellerID)) {
      return res.status(403).json({
        success: false,
        message: "Invalid seller account",
      });
    }

    const hasPaid = await Payment.exists({
      userId: String(authSellerID),
      product: SELLER_PRO_PRODUCT,
      status: "paid",
    });

    if (!hasPaid) {
      const adCount = await AdsPost.countDocuments({
        sellerID: authSellerID,
      });

      if (adCount >= FREE_AD_LIMIT) {
        return res.status(402).json({
          success: false,
          code: "PAYMENT_REQUIRED",
          message:
            "You have used your 2 free ads. Complete the one-time payment to keep posting.",
          data: {
            adCount,
            freeAdLimit: FREE_AD_LIMIT,
            hasPaid: false,
          },
        });
      }
    }

    const data = await AdsPost.create({
      title,
      description,
      category,
      price,
      rentType,
      location,
      quantity,
      image,
      status,
      terms_condition: terms_condition || "Standard rental terms apply.",
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

    const data = await AdsPost.find({ sellerID: authSellerID })
      .populate("sellerID", "name email")
      .sort({
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

export const updateAds = async (req, res) => {
  try {
    const { id } = req.params;
    const authSellerID = req.user?.id ?? req.user?.sub;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ad ID",
      });
    }

    if (!authSellerID || !mongoose.isValidObjectId(authSellerID)) {
      return res.status(403).json({
        success: false,
        message: "Invalid seller account",
      });
    }

    // Status is controlled by admins, so it is intentionally not editable here.
    const editableFields = [
      "title",
      "description",
      "category",
      "price",
      "rentType",
      "location",
      "quantity",
      "image",
      "terms_condition",
    ];

    const updates = {};
    for (const field of editableFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    const data = await AdsPost.findOneAndUpdate(
      { _id: id, sellerID: authSellerID },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Updated Successfully",
      data,
    });
  } catch (error) {
    const statusCode = error.name === "ValidationError" ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

