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

// Hash password before saving (only for local auth)
userSchema.pre("save", async function (next) {
  if (this.provider === "local" && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password (only for local auth)
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (this.provider !== "local") {
    throw new Error("Password comparison not available for OAuth users");
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add findOrCreate plugin
userSchema.plugin(findOrCreate);

const userModel = mongoose.model("User", userSchema);

export { userModel };
