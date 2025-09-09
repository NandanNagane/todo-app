import mongoose from "mongoose";
import findOrCreate from "mongoose-findorcreate";


const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    isEmailPaceholder:{ type: Boolean, default: false },

    profilePictureUrl: { type: String },
    
    authProvider: {
      type: String,
      enum: ["google", "facebook", "local", "twitter"],
      required: true,
      default: "local",
    },
    password: {
      type: String,
      required: function () {
        // Required if user signs up via local (email/password)
        return this.authProvider === "local";
      },
    },
    googleId: {
      type: String,
      required: function () {
        return this.authProvider === "google";
      },
      unique: true,
      sparse: true, // Allows multiple nulls, only unique if present
    },

    facebookId: {
      type: String,
      required: function () {
        return this.authProvider === "facebook";
      },
      unique: true,
      sparse: true,
    },
    twitterId: {
      type: String,
      required: function () {
        return this.authProvider === "twitter";
      },
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

userSchema.plugin(findOrCreate);

const userModel = mongoose.model("User", userSchema);

export { userModel };
