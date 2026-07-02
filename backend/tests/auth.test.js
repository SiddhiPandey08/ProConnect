import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js"; //extract app from server.js below

const TEST_DB = "mongodb://localhost:27017/proconnect_test";

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// ── Register ────────────────────────────────────────────
describe("POST /register", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/register").send({
      name: "Test User",
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
  });

  it("should fail if email already exists", async () => {
    const res = await request(app).post("/register").send({
      name: "Test User",
      username: "testuser2",
      email: "test@example.com", // same email
      password: "password123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  it("should fail if required fields are missing", async () => {
    const res = await request(app).post("/register").send({
      name: "Test User",
      // missing email, password, username
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Please fill all the fields");
  });
});

// ── Login ───────────────────────────────────────────────
describe("POST /login", () => {
  it("should login with correct credentials", async () => {
    const res = await request(app).post("/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.token).toBeDefined(); // token exists
  });

  it("should fail with wrong password", async () => {
    const res = await request(app).post("/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("should fail if user does not exist", async () => {
    const res = await request(app).post("/login").send({
      email: "nobody@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User does not exist");
  });
});
