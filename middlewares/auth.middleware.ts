import expressJwt from "express-jwt";
import { Request } from "express";
import dotenv from "dotenv";

dotenv.config();

// interface IRequest extends Request {
//   cookies: string
// }


export const requireSignin = expressJwt({
  getToken: (req: Request) => req.cookies.token,
  secret: process.env.JWT_SECRET!,
  algorithms: ["HS256"],
});
