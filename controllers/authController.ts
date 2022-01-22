import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import AppError from "../utils/appError";
import User from "../models/userModel";
import { Email } from "../utils/email";

import dayjs from "dayjs";
import UserProfile from "../models/userModel";
import HospitalProfile from "../models/hospitalProfileModel";
const { promisify } = require("util");

// Generate token function
const signToken = (id: string) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

// createActivationToken
// const createActivationToken = (payload: {
//   email: string;
//   language: string;
// }): string => {
//   return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET!, {
//     expiresIn: "30m",
//   });
// };

// signup controller
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, fullName, hospitalName, passwordConfirm, type } =
      req.body;

    // check if user exist
    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return next(new AppError(400, "This email already exist"));
    }

    // check if password and password confirm match
    if (password !== passwordConfirm) {
      return next(
        new AppError(400, "Password and password confirm do not match")
      );
    }

    // create a new user
    const user = await User.create({
      email,
      password,
      role: type === "hospital" ? "admin" : "user",
    });

    // check if type is hospital
    if (type === "hospital") {
      // create a new hospital profile
      const hospitalProfile = await HospitalProfile.create({
        email,
        hospitalName,
        fullName,
        role: "admin",
      });

      // send welcome email
      await new Email(hospitalProfile, process.env.CLIENT_URL!).sendWelcome();
      const token = signToken(user._id!);

      res.cookie("token", token, {
        httpOnly: true,
        expires: dayjs().add(30, "minute").toDate(),
        sameSite: "none",
        secure: process.env.NODE_ENV === "production",
      });

      res.status(200).json(hospitalProfile);
    } else if (type === "user") {
      // create a new user profile
      const userProfile = await UserProfile.create({
        email,
        fullName,
        role: "user",
      });

      // invoke the welcome email
      await new Email(user, process.env.CLIENT_URL!).sendWelcome();

      const token = signToken(user._id!);

      res.cookie("token", token, {
        httpOnly: true,
        expires: dayjs().add(30, "minute").toDate(),
        sameSite: "none",
        secure: process.env.NODE_ENV === "production",
      });

      res.status(200).json(userProfile);
    }
  }
);

// login controller
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError(400, "Invalid Credentials"));
  }

  // check if user is activated
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError(400, "Invalid Credentials"));
  }

  const match = await bcrypt.compare(password, user.password!);

  if (!user || !match) {
    return next(new AppError(400, "Invalid Credentials"));
  }

  // create jwt
  // create jwt
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "30m",
  });

  res.cookie("token", token, {
    httpOnly: false,
    expires: dayjs().add(30, "minute").toDate(),
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
  });

  const { password: pass, ...rest } = user;

  res.status(200).json({ msg: "Login successful", token });
});

// logout
export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie("token", "loggedOut", {
      httpOnly: true,
      expires: new Date(Date.now() + 10 * 1000),
    });
    res.clearCookie("token");

    res.status(200).json({ msg: "Signout success" });
  }
);

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Getting token and check if its there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
    if (!token) {
      return next(
        new AppError(401, "You are not logged In! Please login to get access")
      );
    }
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) check if user still exist
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError(
          401,
          "the user belonging to the token does no longer exist"
        )
      );
    }

    // GRANT ACCESS TO THE PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  }
);

export const currentUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(res.locals.user.id);

    if (!user) {
      return next(new AppError(403, "UnAuthorized"));
    }

    // get the patient profile or hospital profile depending on the user role
    const profile =
      user.role === "user"
        ? await UserProfile.findById(user.id)
        : await HospitalProfile.findById(user.id);

    res.status(200).json(profile);
  }
);

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError(400, "Invalid Email"));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(404, "email not found"));
  }

  const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "10m",
  });
  const url = `${process.env.CLIENT_URL!}/user/reset/${access_token}/password`;

  await new Email(user, url).sendPasswordReset();
  res
    .status(200)
    .json({ msg: "Re-send the password, please check your email." });
});

export const resetPassword = asyncHandler(async (req: Request, res, next) => {
  const { newPassword, passwordConfirm, token } = req.body;

  if (newPassword !== passwordConfirm) {
    return next(new AppError(400, "password does not match"));
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

  const user = await User.findById(payload.id).select("+password");

  if (!user) {
    return next(new AppError(400, "user not found"));
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({ msg: "password changed successfully" });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  // 1) Get user from collection
  const { newPassword, passwordConfirm } = req.body;
  if (!newPassword || !passwordConfirm) {
    return next(new AppError(400, "please provide new password"));
  }

  if (newPassword !== passwordConfirm) {
    return next(new AppError(400, "password does not match"));
  }

  console.log(newPassword, "confirm", passwordConfirm);
  const user = await User.findById(res.locals.user.id).select("+password");

  if (!user) {
    return next(new AppError(400, "user not found"));
  }

  // 3) If so, update password
  user.password = newPassword;
  await user.save();

  // log the user out
  res.clearCookie("token");
  res.status(200).json({ msg: "password changed successfully, login again" });
});