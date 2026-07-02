import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";

const TEST_DB = "mongodb://127.0.0.1:27017/proconnect_test";

let token;
let username = "testuser";

beforeAll(async () => {
  await mongoose.connect(TEST_DB);

  await request(app).post("/register").send({
    name: "Test User",
    username,
    email: "test@test.com",
    password: "password123",
  });

  const login = await request(app).post("/login").send({
    email: "test@test.com",
    password: "password123",
  });

  token = login.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Profile Flow", () => {
  it("should update user information", async () => {
    const res = await request(app).post("/update_profile").send({
      token,
      name: "Updated User",
      username: "updateduser",
      email: "updated@test.com",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Profile updated successfully");

    username = "updateduser";
  });

  it("should reject duplicate username", async () => {
    await request(app).post("/register").send({
      name: "Another User",
      username: "duplicateuser",
      email: "duplicate@test.com",
      password: "password123",
    });

    const res = await request(app).post("/update_profile").send({
      token,
      username: "duplicateuser",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Username or email already exists");
  });

  it("should reject duplicate email", async () => {
    const res = await request(app).post("/update_profile").send({
      token,
      email: "duplicate@test.com",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Username or email already exists");
  });

  it("should reject invalid token while updating profile", async () => {
    const res = await request(app).post("/update_profile").send({
      token: "invalidtoken",
      username: "abc",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  it("should update profile data", async () => {
    const res = await request(app)
      .post("/update_profile_data")
      .send({
        token,
        bio: "Passionate Full Stack Developer",
        currentPosition: "Software Engineering Student",
        education: [
          {
            school: "TCET",
            degree: "B.Tech",
            fieldOfStudy: "Computer Engineering",
          },
        ],
        pastWork: [
          {
            company: "Microsoft",
            position: "SDE Intern",
            current: true,
          },
        ],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Profile data updated successfully");
  });

  it("should reject invalid token while updating profile data", async () => {
    const res = await request(app).post("/update_profile_data").send({
      token: "invalidtoken",
      bio: "Hello",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  it("should fetch user profile using token", async () => {
    const res = await request(app).get(`/get_user_profile/${token}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.user.userId.name).toBe("Updated User");
    expect(res.body.user.userId.username).toBe("updateduser");
    expect(res.body.user.bio).toBe("Passionate Full Stack Developer");
    expect(res.body.user.currentPosition).toBe("Software Engineering Student");
    expect(res.body.user.education.length).toBe(1);
    expect(res.body.user.pastWork.length).toBe(1);
  });

  it("should fail to fetch profile with invalid token", async () => {
    const res = await request(app).get("/get_user_profile/invalidtoken");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  it("should fetch profile by username", async () => {
    const res = await request(app).get("/user/get_user_by_username").query({
      username,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.profile.userId.username).toBe(username);
  });

  it("should fail when username does not exist", async () => {
    const res = await request(app).get("/user/get_user_by_username").query({
      username: "doesnotexist",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  it("should return all users", async () => {
    const res = await request(app).get("/user/get_all_users");

    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(0);

    expect(res.body.users[0]).toHaveProperty("userId");
    expect(res.body.users[0].userId).toHaveProperty("name");
    expect(res.body.users[0].userId).toHaveProperty("username");
    expect(res.body.users[0].userId).toHaveProperty("email");
  });

  it("should update only the bio", async () => {
    await request(app).post("/update_profile_data").send({
      token,
      bio: "Updated Bio",
    });

    const res = await request(app).get(`/get_user_profile/${token}`);

    expect(res.body.user.bio).toBe("Updated Bio");
  });

  it("should allow empty bio", async () => {
    const res = await request(app).post("/update_profile_data").send({
      token,
      bio: "",
    });

    expect(res.statusCode).toBe(200);

    const profile = await request(app).get(`/get_user_profile/${token}`);

    expect(profile.body.user.bio).toBe("");
  });
});
