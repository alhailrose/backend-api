import express from "express";
import { upload } from "../middleware/upload.js";

import auth from "../middleware/authentication.js";

import {
  updateUser,
  getUserById,
  getAllUsers,
  changePassword,
} from "../controllers/usersController.js";

const router = express.Router();

router.get("/users/:id", getUserById);
router.get("/users/", getAllUsers);

router.put(
  "/users/update-users/:id",
  auth,
  upload.single("imgUrl"),
  updateUser
);
router.put("/users/change-password/:id", auth, changePassword);

export default router;
