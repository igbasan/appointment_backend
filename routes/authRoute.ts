import { createValidationRules } from "./../middlewares/validationRules/register-validation";
import {
  register,
  login,
  currentUser,
  forgotPassword,
  resetPassword,
  logout,
  protect,
 updatePassword,

} from "./../controllers/authController";
import { Router } from "express";
import { validateRequestSchema } from "../middlewares/validate-request-schema";
import { userValidationRules } from "../middlewares/validationRules/create-validation";
import { requireSignin } from "../middlewares/auth.middleware";
import { resetValidationRules } from "../middlewares/validationRules/reset-password-validation";


const router = Router();

// sign up endpoint
router.post(
  "/register",
  userValidationRules(),
  validateRequestSchema,
  register
);



// login endpoint
router.post("/login", login);

// get the current Logged in user endpoint
router.get("/currentUser", protect, currentUser);

// forgotPassword endpoint
router.post("/forgotPassword", forgotPassword);

// reset Password endpoint
router.post(
  "/resetPassword",
  resetValidationRules(),
  validateRequestSchema,
  resetPassword
);

// user logout endpoint
router.get("/logout", logout);





router.post('/updatePassword', protect, updatePassword);
// router.get('/encrypt', encrypt)

export { router as authRouter };
