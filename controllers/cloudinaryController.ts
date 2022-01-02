import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import asyncHandler from "express-async-handler";
import AppError from "../utils/appError";




export const uploadFile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
   const {file} = req.body
    if (!file) {
      return next(new AppError(404, "no file specified"));
    }
    const result = await cloudinary.uploader.upload(file, {
      public_id: `${Date.now()}`,
      resource_type: "auto",
    });

    res.status(200).json({
      public_id: result.public_id,
      url: result.secure_url,
    });

    res.status(200).json({msg: 'Successfully uploaded'})
  }
);

export const removeFile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const fileId = req.body.public_id;

    const result = await cloudinary.uploader.destroy(fileId);

    if (!result) {
      return next(new AppError(400, "Cloudinary error"));
    }

    res.status(204).json({ message: "file removed successfully" });
  }
);
