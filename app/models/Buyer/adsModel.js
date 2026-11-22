import mongoose from "mongoose";

const adsSchema = mongoose.Schema({
  image: {
    type: String,
    required: true,
    trim: true,
  },
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
});
