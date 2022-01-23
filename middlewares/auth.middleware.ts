import expressJwt from "express-jwt";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();



export const requireSignin = expressJwt({
  getToken: (req: Request) => req.cookies.token,
  secret: process.env.JWT_SECRET!,
  algorithms: ["HS256"],
});

// middleware to check if user role is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (res.locals.user.role === "admin") {
    next();
  } else {
    return res.status(401).json({
      error: "You are not authorized to perform this action",
    });
  }
};
