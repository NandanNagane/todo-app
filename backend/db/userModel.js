import mongoose from "mongoose";
import bcrypt from "bcrypt";
import findOrCreate from "mongoose-findorcreate";


const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
    },
    googleId: {
      type: String,
      required: function () {
        return this.provider === "google";
      },
      unique: true,
      sparse: true,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    profilePictureUrl: {  // ⭐ Add this field
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Add findOrCreate plugin
userSchema.plugin(findOrCreate);

const userModel = mongoose.model("User", userSchema);

export { userModel };
