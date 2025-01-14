import {
  getUserById,
  getAllUsers,
  changePassword,
  updateUser,
} from "../controllers/usersController.js";
import {
  getUserByIdModel,
  getAllUsersModel,
  changePasswordModel,
  updateUserModel,
} from "../models/usersModel.js";
import bcrypt from "bcrypt";
import { uploadProfilePhotoToSpaces } from "../middleware/upload.js";

jest.mock("../models/usersModel.js", () => ({
  getUserByIdModel: jest.fn(),
  getAllUsersModel: jest.fn(),
  changePasswordModel: jest.fn(),
  updateUserModel: jest.fn(),
}));

jest.mock("../middleware/upload.js", () => ({
  uploadProfilePhotoToSpaces: jest.fn(),
  deleteFileFromSpaces: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe("User Management API", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // === Test Cases ===

  // Test getUserById success case
  test("should return user data if user exists (getUserById)", async () => {
    req.params = { id: "1" };
    getUserByIdModel.mockResolvedValue([
      {
        user_id: "1",
        name: "John Doe",
        password: "hashedPassword",
        photoProfileUrl: "oldPhotoUrl",
      },
    ]);

    await getUserById(req, res);

    expect(getUserByIdModel).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "User found",
      data: {
        user_id: "1",
        name: "John Doe",
        photoProfileUrl: "oldPhotoUrl",
      },
    });
  });

  // Test getUserById user not found
  test("should return 404 if user does not exist (getUserById)", async () => {
    req.params = { id: "2" };
    getUserByIdModel.mockResolvedValue([]);

    await getUserById(req, res);

    expect(getUserByIdModel).toHaveBeenCalledWith("2");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "failed",
      message: "User not found",
      data: null,
    });
  });

  // Test getAllUsers success
  test("should return all users (getAllUsers)", async () => {
    getAllUsersModel.mockResolvedValue([
      { user_id: "1", name: "John Doe", email: "john@example.com" },
      { user_id: "2", name: "Jane Doe", email: "jane@example.com" },
    ]);

    await getAllUsers(req, res);

    expect(getAllUsersModel).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Users found",
      data: [
        { user_id: "1", name: "John Doe", email: "john@example.com" },
        { user_id: "2", name: "Jane Doe", email: "jane@example.com" },
      ],
    });
  });

  // Test changePassword user not found
  test("should return 404 if user is not found during password change (changePassword)", async () => {
    req.params = { id: "1" };
    req.body = {
      oldPassword: "oldPass",
      newPassword: "newPass",
      confirmPassword: "newPass",
    };
    getUserByIdModel.mockResolvedValue([]);

    await changePassword(req, res);

    expect(getUserByIdModel).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "failed",
      message: "User not found",
    });
  });

  // Test changePassword old password incorrect
  test("should return 400 if old password is incorrect (changePassword)", async () => {
    req.params = { id: "1" };
    req.body = {
      oldPassword: "oldPass",
      newPassword: "newPass",
      confirmPassword: "newPass",
    };
    getUserByIdModel.mockResolvedValue([
      { user_id: "1", password: "hashedPassword" },
    ]);
    bcrypt.compare.mockResolvedValue(false); // Simulate incorrect password

    await changePassword(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith("oldPass", "hashedPassword");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "failed",
      message: "Old password is incorrect",
    });
  });

  // Test changePassword new password mismatch
  test("should return 400 if new password and confirm password do not match (changePassword)", async () => {
    req.params = { userId: "1" };
    req.body = {
      oldPassword: "oldPass",
      newPassword: "newPass",
      confirmPassword: "wrongPass",
    };
    getUserByIdModel.mockResolvedValue([
      { userId: "1", password: "hashedPassword" },
    ]);

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "failed",
      message: "New password and confirm password do not match",
    });
  });

  // Test successful password change
  test("should successfully change password (changePassword)", async () => {
    req.params = { id: "1" };
    req.body = {
      oldPassword: "oldPass",
      newPassword: "newPass",
      confirmPassword: "newPass",
    };
    getUserByIdModel.mockResolvedValue([
      { user_id: "1", password: "hashedPassword" },
    ]);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("newHashedPassword");
    changePasswordModel.mockResolvedValue({ affectedRows: 1 });

    await changePassword(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith("oldPass", "hashedPassword");
    expect(bcrypt.hash).toHaveBeenCalledWith("newPass", 10);
    expect(changePasswordModel).toHaveBeenCalledWith("1", "newHashedPassword");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Password updated successfully",
    });
  });

  // Test updateUser user not found
  test("should return 404 if user not found during updateUser", async () => {
    req.params = { id: "1" };
    req.body = { name: "New Name", email: "newemail@example.com" };
    req.file = null; // Simulate no file uploaded
    getUserByIdModel.mockResolvedValue([]);

    await updateUser(req, res);

    expect(getUserByIdModel).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "failed",
      message: "User not found",
      data: null,
    });
  });

  // Test updateUser success
  test("should update user data and return the updated user (updateUser)", async () => {
    req.params = { id: "1" };
    req.body = { name: "New Name", email: "newemail@example.com" };
    req.file = null; // Simulate no file uploaded
    getUserByIdModel.mockResolvedValue([
      {
        user_id: "1",
        name: "Old Name",
        email: "oldemail@example.com",
        photoProfileUrl: "oldPhotoUrl",
      },
    ]);
    updateUserModel.mockResolvedValue({ affectedRows: 1 });
    getUserByIdModel.mockResolvedValue([
      {
        user_id: "1",
        name: "New Name",
        email: "newemail@example.com",
        photoProfileUrl: "oldPhotoUrl",
      },
    ]);

    await updateUser(req, res);

    expect(updateUserModel).toHaveBeenCalledWith("1", {
      name: "New Name",
      email: "newemail@example.com",
      photoProfileUrl: "oldPhotoUrl",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "User updated successfully",
      dataUpdate: {
        user_id: "1",
        name: "New Name",
        email: "newemail@example.com",
        photoProfileUrl: "oldPhotoUrl",
      },
    });
  });

  describe("uploadProfilePhotoToSpaces", () => {
    test("should upload profile photo and return URL", async () => {
      req.file = { buffer: Buffer.from("fake-file"), mimetype: "image/png" };

      uploadProfilePhotoToSpaces.mockResolvedValue(
        "https://example.com/new-photo.png"
      );

      const result = await uploadProfilePhotoToSpaces(req.file);

      expect(uploadProfilePhotoToSpaces).toHaveBeenCalledWith(req.file);
      expect(result).toBe("https://example.com/new-photo.png");
    });

    test("should handle upload errors", async () => {
      req.file = { buffer: Buffer.from("fake-file"), mimetype: "image/png" };

      uploadProfilePhotoToSpaces.mockRejectedValue(new Error("Upload error"));

      await expect(uploadProfilePhotoToSpaces(req.file)).rejects.toThrow(
        "Upload error"
      );
    });
  });
});
