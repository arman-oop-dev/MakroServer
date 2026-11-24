import mongoose from "mongoose";

import AdsPost from "../models/adsModel.js";
import "../models/userModel.js";

export const getPendingAds = async (req, res) => {
  try {
    const adminID = req.params.adminID;
    const authAdminID = req.user?.id ?? req.user?.sub;

    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID",
      });
    }

    if (!authAdminID || String(authAdminID) !== adminID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await AdsPost.find({ status: "pending" })
      .populate("sellerID", "name email image")
      .sort({ createdAt: -1 })
      .lean();

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

export const updateAdStatus = async (req, res) => {
  // /:adminID/ads/:adsID/status
  try {
    const { adminID, adsID } = req.params;
    const authAdminID = req.user?.id ?? req.user?.sub;

    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(adsID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ad ID",
      });
    }

    if (!authAdminID || String(adminID) !== String(authAdminID)) {
      return res.status(403).json({
        success: false,
        message: "You can only update ads with your own admin account",
      });
    }

    const { status } = req.body;
    const allowedStatus = ["pending", "approved", "rejected"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const data = await AdsPost.findByIdAndUpdate(
      adsID,
      { $set: { status } },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ad status updated successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
