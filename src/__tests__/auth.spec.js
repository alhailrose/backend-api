import {
    signUp,
    signIn,
    signOut,
  } from "../controllers/authenticationController.js";
  
  import {
    signupAuthModel,
    checkedEmailRegister,
    signinAuthModel,
    signoutAuthModel,
  } from "../models/authenticationModels.js";

  import bcrypt from "bcrypt";
  import jwt from "jsonwebtoken";
  
  jest.mock("../models/authenticationModels.js");
  jest.mock("bcrypt");
  jest.mock("jsonwebtoken");
  
  process.env.JWT_SECRET = "test_jwt_secret";
  process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret";
  
  describe("Authentication Controller", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    describe("signUp", () => {
      it("should create a new user if email is not registered", async () => {
        checkedEmailRegister.mockResolvedValue(false);
        signupAuthModel.mockResolvedValue([{ user_id: "123" }]);
        bcrypt.hash.mockResolvedValue("hashed_password");
  
        const req = { body: { email: "test@example.com", password: "password" } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
  
        await signUp(req, res);
  
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          message: "User created successfully",
          data: { email: "test@example.com" },
        });
      });
  
      it("should return error if email is already registered", async () => {
        checkedEmailRegister.mockResolvedValue(true);
  
        const req = { body: { email: "test@example.com", password: "password" } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
  
        await signUp(req, res);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          status: "failed",
          message: "Email already registered",
          data: null,
        });
      });
    });
  
    describe("signIn", () => {
      it("should log in a user with correct credentials", async () => {
        signinAuthModel.mockResolvedValue([
          {
            user_id: "123",
            password: "hashed_password",
            email: "test@example.com",
            name: "Test User",
            photoProfileUrl: "test.jpg",
          },
        ]);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue("test_access_token");
  
        const req = { body: { email: "test@example.com", password: "password" } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
  
        await signIn(req, res);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          user_id: "123",
          name: "Test User",
          email: "test@example.com",
          photoProfileUrl: "test.jpg",
          access_token: "test_access_token",
          message: "Login success",
        });
      });
  
      it("should return error if email is not registered", async () => {
        signinAuthModel.mockResolvedValue([]);
  
        const req = { body: { email: "wrong@example.com", password: "password" } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
  
        await signIn(req, res);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          status: "failed",
          message: "Email not registered",
          data: null,
        });
      });
  
      it("should return error if password is incorrect", async () => {
        signinAuthModel.mockResolvedValue([
          {
            user_id: "123",
            password: "hashed_password",
            email: "test@example.com",
            name: "Test User",
            photoProfileUrl: "test.jpg",
          },
        ]);
        bcrypt.compare.mockResolvedValue(false);
  
        const req = { body: { email: "test@example.com", password: "wrong_password" } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
  
        await signIn(req, res);
  
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          status: "failed",
          message: "Password not match",
          data: null,
        });
      });
    });
  
    describe("signOut", () => {
      it("should sign out a user if token is valid", async () => {
        signoutAuthModel.mockResolvedValue();
  
        const req = { headers: { authorization: "Bearer valid_token" } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
  
        await signOut(req, res);
  
        expect(signoutAuthModel).toHaveBeenCalledWith("valid_token");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          message: "Signout success",
          data: null,
        });
      });
  
      it("should return error if token is missing", async () => {
        const req = { headers: {} };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
  
        await signOut(req, res);
  
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          status: "failed",
          message: "Token is expired or not found",
          data: null,
        });
      });
    });
  });
  