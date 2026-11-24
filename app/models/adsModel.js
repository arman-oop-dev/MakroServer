import mongoose from "mongoose";

const adsPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [20, "description must be at least 20 characters long"],
    },

    category: {
      type: String,
      enum: [
        "construction",
        "photography",
        "vehicles",
        "agriculture",
        "electronics",
        "event",
        "others",
      ],
      default: "others",
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    rentType: {
      type: String,
      enum: ["hour", "day", "week", "month"],
      default: "day",
    },

    location: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    // controll by admin
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    terms_condition: {
      type: String,
      required: true,
    },

    sellerID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const AdsPost = mongoose.model("adsPost", adsPostSchema);
export default AdsPost;
