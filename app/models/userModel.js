import mongoose from "mongoose";

// Better Auth owns this collection. Registering a read-only-shaped model here
// lets Mongoose populate refs that point at Better Auth users.
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    image: String,
    role: String,
  },
  {
    collection: "user",
    versionKey: false,
  },
);

const User = mongoose.models.user || mongoose.model("user", userSchema);

export default User;
