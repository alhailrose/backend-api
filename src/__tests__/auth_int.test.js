// integration.test.js
import request from "supertest";
import { createApp } from "../config/app.js";
import dbPool from "../config/connection.js";

describe("Authentication Integration Tests", () => {
  let app;

  beforeAll(() => {
    app = createApp(); // Create an instance of the app
  });

  afterAll(async () => {
    // Clean up database and close pool connection
    await dbPool.execute("DELETE FROM user WHERE email LIKE ?", [
      "%example.com",
    ]);
    await dbPool.end();
  });

  describe("POST /signup", () => {
    it("should successfully register a user", async () => {
      const response = await request(app).post("/signup").send({
        name: "Test User",
        email: "testuser@example.com",
        password: "Password123",
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("User created successfully");
      expect(response.body.data).toHaveProperty("name", "Test User");
      expect(response.body.data).toHaveProperty(
        "email",
        "testuser@example.com"
      );
    });

    it("should fail if email is already registered", async () => {
      const response = await request(app).post("/signup").send({
        name: "Test User",
        email: "testuser@example.com",
        password: "Password123",
      });
      console.log(response.body);
      console.log(response.status);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe("failed");
      expect(response.body.message).toBe("Email already registered");
    });
  });

  describe("POST /signin", () => {
    it("should successfully login a user", async () => {
      const response = await request(app).post("/signin").send({
        email: "testuser@example.com",
        password: "Password123",
      });

      console.log(response.body);
      console.log(response.status);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body).toHaveProperty("access_token");
    });

    it("should fail if email is not registered", async () => {
      const response = await request(app).post("/signin").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("failed");
      expect(response.body.message).toBe("Email not registered");
    });

    it("should fail if password is incorrect", async () => {
      const response = await request(app).post("/signin").send({
        email: "testuser@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("failed");
      expect(response.body.message).toBe("Password not match");
    });
  });
});
