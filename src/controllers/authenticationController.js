import {
  signupAuthModel,
  checkedEmailRegister,
  signinAuthModel,
  signoutAuthModel,
} from "../models/authenticationModels.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const signUp = async (req, res) => {
  const { body } = req;
  const user_id = Math.random().toString(36).substring(2, 10);
  // console.log(user_id);
  const dates = new Date();
  try {
    const isEmailRegistered = await checkedEmailRegister(body.email);
    if (isEmailRegistered) {
      return res.status(400).json({
        status: "failed",
        message: "Email already registered",
        data: null,
      });
    }
    const hashedPassword = await hashPassword(body.password);
    const [data] = await signupAuthModel(body, user_id, dates, hashedPassword);

    const responseData = { ...body };
    delete responseData.password;

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
      data: null,
    });
  }
};

const hashPassword = async (password) => {
  const salt = 10;
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const signIn = async (req, res) => {
  const { body } = req;
  try {
    // Mendapatkan user berdasarkan email
    const users = await signinAuthModel(body.email);
    if (!users || users.length === 0) {
      return res.status(400).json({
        status: "failed",
        message: "Email not registered",
        data: null,
      });
    }

    // Mengambil user pertama
    const user = users[0];

    // Memeriksa kecocokan password
    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "failed",
        message: "Password not match",
        data: null,
      });
    }

    // Membuat payload untuk token
    const loguser = {
      id: user.user_id,
      email: user.email,
      name: user.name,
      photoProfileUrl: user.photoProfileUrl,
    };

    // Membuat access token
    const accessToken = jwt.sign(loguser, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Menyusun respon
    const responseData = {
      status: "success",
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      photoProfileUrl: user.photoProfileUrl,
      access_token: accessToken,
      message: "Login success",
    };

    // Mengirim respon dengan status 200
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in signIn:", error.message);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
      data: null,
    });
  }
};

//authenticationController.js
const signOut = async (req, res) => {
  try {
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      await signoutAuthModel(token); // No need to destructure the result
      res.status(200).json({
        status: "success",
        message: "Signout success",
        data: null,
      });
    } else {
      return res.status(422).json({
        status: "failed",
        message: "Token is expired or not found",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
      data: null,
    });
  }
};

export { signUp, signIn, signOut };
