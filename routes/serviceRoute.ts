import multer from "multer";
import { Router } from "express";
import { protect } from "../controllers/authController";
import { isAdmin } from "../middlewares/auth.middleware";
const router = Router();

// set multer storage
const storage = multer.diskStorage({});

const upload = multer({
  storage,
});

router.use(protect);
router.use(isAdmin)



export { router as serviceRouter };
