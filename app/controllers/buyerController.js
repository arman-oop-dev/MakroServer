import AdsPost from "../models/adsModel.js";

export const getAllAds = async (req, res) => {
  try {
    const data = await AdsPost.find({ status: "approved" }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data,
      ...(data.length === 0 && { message: "There is no ads post yet!" }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
