import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import User, { IUser } from "../models/userModel";
import AppError from "../utils/appError";

export const userPhotoUpload = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {


    if (!req.file) {
     return next(new AppError(400, "Sorry! we need an image"));
   }



   const upload = await cloudinary.uploader.upload(req.file.path, {
     folder: "user-avatars",
     resource_type: "image",
   });

   if (!upload) {
     return next(new AppError(400, "cloudinary error"));
   }



    const updatedUser = await User.findByIdAndUpdate(
      res.locals.user?.id,
      {
        avatar: upload.secure_url,
      },
      {
        new: true,

      }
    );

    res.status(200).json(updatedUser);
  }
);

// @desc Update user profile

// @route Patch /api/v1/users/updateMe

// @access Private
export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Create error if user POSTs Password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError(400, "This route is not for password Update"));
    }
    // 3) Filtered out unwanted fields names that are not allowed to be updated
    const { password, avatar, role, email, ...rest } = req.body;
    // 2)Update User document

    const updatedUser = await User.findByIdAndUpdate(
      {
        _id: res.locals.user?.id,
      },
      rest,
      {
        new: true,
      }
    );
    res.status(200).json(updatedUser);
  }
);

// update email
export const updateEmail = asyncHandler(async (req, res, next) => {
  // 1) Get user from collection
  const { newEmail, password } = req.body;
  if (!newEmail || !password) {
    return next(new AppError(400, "please provide new Email with password"));
  }
  const user = await User.findById(res.locals.user?.id).select("+password");

  if (!user) {
    return next(new AppError(400, "Invalid Credentials"));
  }
  const match = await bcrypt.compare(password, user.password!);
  if (!user || !match) {
    return next(new AppError(400, "user not found"));
  }

  // 3) If so, update password
  user.email = newEmail;
  await user.save();
  // log the user out
  res.clearCookie("token");
  res.status(200).json({ msg: "Email changed successfully, login again" });
});


export const getTeams = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // get the user id
    const userId = res.locals.user.id;
    //get the user and populate the teams
    const user = await User.findById(userId).populate("teams.team", "firstName lastName email");

    if (!user) {
      return next(new AppError(404, "User not found"));
    }

    // omit the _id from user.teams
    const teams = user.teams.map((team: any) => {
      return {

        firstName: team.team.firstName,
        lastName: team.team.lastName,
        email: team.team.email,
        role: team.role,
        status: team.status,
        teamId: team.team._id,
      }
    });

    res.status(200).json(teams);

    // res.status(200).json(sharedContacts);
  }
);


// remove team from user
export const removeTeam = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // get the user id
  const userId = res.locals.user.id;
  //get the user and populate the teams
  const user = await User.findById(userId).populate("teams.team", "firstName lastName email");

  if (!user) {
    return next(new AppError(404, "User not found"));
  }

  // get the team id
  const teamId = req.params.teamId;

  // find the team
  const team = user.teams.find((team: any) => team.team._id.toString() === teamId);

  if (!team) {
    return next(new AppError(404, "Team not found"));
  }

  // remove the team
  user.teams = user.teams.filter((team: any) => team.team._id.toString() !== teamId);

  await user.save();

  res.status(200).json(user);
}
);

// remove multiple teams from user
export const removeMultipleTeams = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // get the user id
  const userId = res.locals.user.id;
  //get the user and populate the teams
  const user = await User.findById(userId).populate("teams.team", "firstName lastName email");

  if (!user) {
    return next(new AppError(404, "User not found"));
  }

  // get the team id
  const teamIds = req.body.teamIds;

  // find the team
  user.teams = user.teams.filter((team: any) => !teamIds.includes(team.team._id.toString()));

  await user.save();

  res.status(200).json(user);
}
);