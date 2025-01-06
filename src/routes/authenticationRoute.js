import express from "express";
import dotenv from "dotenv";
import {
  signIn,
  signUp,
  signOut,
} from "../controllers/authenticationController.js";
import auth from "../middleware/authentication.js";

dotenv.config();

const router = express.Router();

router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/signout", auth, signOut);

export default router;
