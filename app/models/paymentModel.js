import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    amountCents: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    product: {
      type: String,
      default: "seller_pro",
    },
    status: {
      type: String,
      enum: ["paid"],
      default: "paid",
    },
    email: {
      type: String,
      default: "",
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "payments",
    versionKey: false,
  },
);

const Payment =
  mongoose.models.payment || mongoose.model("payment", paymentSchema);

export default Payment;
