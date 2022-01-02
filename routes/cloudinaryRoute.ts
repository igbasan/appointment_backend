import { Router } from "express";
import multer from "multer";
import { removeFile, uploadFile } from "../controllers/cloudinaryController";
const router = Router();

// const storage = multer.diskStorage({});

// const upload = multer({
//   storage,
// });

router.post("/upload", uploadFile);
router.post("/remove", removeFile);

export { router as cloudinaryRouter };
