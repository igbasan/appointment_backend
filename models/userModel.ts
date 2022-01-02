import bcrypt from "bcrypt";
import mongoose, { Schema, Document, AnyKeys } from "mongoose";
import validator from "validator";
import crypto from "crypto";

enum Role {
  USER = "user",
  ADMIN = "admin",
}

export interface IUser extends Document {
  _id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: Role;
  avatar?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },

    password: {
      type: String,
      trim: true,
      required: [true, "Please provide a password"],
      minlength: 4,
      select: false,
    },


    phone: String,
    role: {
      type: String,
      default: Role.USER,
    },



    avatar: {
      type: String,
      default: "",
    },


    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// hash the password before save into database
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// check if the password coming from the client is correct to the one in database
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// // method to check if the user changed password
// userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changeTimestamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10
//     );
//     console.log(changeTimestamp, JWTTimestamp);

//     return JWTTimestamp < changeTimestamp;
//   }

//   // false means Not changed
//   return false;
// };

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
