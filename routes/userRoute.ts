import  multer  from 'multer';
import { Router } from "express";

import { getTeams, removeMultipleTeams, removeTeam, updateEmail, updateProfile, userPhotoUpload } from "../controllers/userController";
import { requireSignin } from "../middlewares/auth.middleware";
import { protect } from '../controllers/authController';
const router = Router();

// set multer storage
const storage = multer.diskStorage({});

const upload = multer({
  storage,
});


 router.use(protect);

router.post(
  "/uploadAvatar",
  upload.single("avatar"),
 userPhotoUpload
);


router.patch("/updateProfile", updateProfile);

router.post("/updateEmail", updateEmail);

router.get("/teams", getTeams);

router.patch("/removeTeam/:teamId", removeTeam);
// remove multiple teams
router.patch("/removeTeams", removeMultipleTeams);

export { router as userRouter };
