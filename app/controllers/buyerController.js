import AdsPost from "../models/adsModel.js";

export const getAllAds = async (req, res) => {
  try {
    const query = {};

    const toValues = (input) => {
      const raw = Array.isArray(input) ? input : input === undefined ? [] : [input];

      return raw
        .filter((item) => typeof item === "string" || typeof item === "number")
        .map((item) => String(item).trim())
        .filter(Boolean);
    };

    const applyMultiFilter = (field, input) => {
      const values = toValues(input);
      if (values.length) query[field] = { $in: values };
    };

    applyMultiFilter("category", req.query.category);
    applyMultiFilter("rentType", req.query.rentType);
    applyMultiFilter("city", req.query.city);

    const searches = toValues(req.query.search);
    if (searches.length) {
      query.$or = searches.flatMap((search) => [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]);
    }

    const parsedLimit = Number.parseInt(toValues(req.query.limit)[0] ?? "", 10);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 50)
        : 0;

    const sortValue = toValues(req.query.sort)[0];
    const sort =
      sortValue === "price"
        ? { price: 1, createdAt: -1 }
        : { createdAt: -1 };

    let adsQuery = AdsPost.find({
      status: "approved",
      ...query,
    }).sort(sort);

    if (limit) adsQuery = adsQuery.limit(limit);

    const data = await adsQuery;

    return res.status(200).json({
      success: true,
      totalAds: data.length,
      data,
      ...(data.length === 0 && {
        message: "There are no ads posts yet!",
      }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
