import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";

const TEST_DB = "mongodb://127.0.0.1:27017/proconnect_test";

let senderToken;
let receiverToken;
let receiverId;
let connectionReqId;

beforeAll(async () => {
  await mongoose.connect(TEST_DB);

  // Register sender
  await request(app).post("/register").send({
    name: "Sender",
    username: "sender",
    email: "sender@test.com",
    password: "password123",
  });

  // Register receiver
  await request(app).post("/register").send({
    name: "Receiver",
    username: "receiver",
    email: "receiver@test.com",
    password: "password123",
  });

  // Login sender
  const sender = await request(app).post("/login").send({
    email: "sender@test.com",
    password: "password123",
  });

  senderToken = sender.body.token;

  // Login receiver
  const receiver = await request(app).post("/login").send({
    email: "receiver@test.com",
    password: "password123",
  });

  receiverToken = receiver.body.token;
  receiverId = receiver.body.userId;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Connection Request Flow", () => {
  it("should send a connection request", async () => {
    const res = await request(app).post("/user/send_connection_request").send({
      token: senderToken,
      targetUserId: receiverId,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Connection request sent successfully");
  });

  it("should not allow duplicate requests", async () => {
    const res = await request(app).post("/user/send_connection_request").send({
      token: senderToken,
      targetUserId: receiverId,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Connection request already sent");
  });

  it("should return pending requests", async () => {
    const res = await request(app)
      .get("/user/get_connection_requests_for_me")
      .query({
        token: receiverToken,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.connectionRequests.length).toBeGreaterThan(0);

    connectionReqId = res.body.connectionRequests[0]._id;
  });

  it("should not allow another user to accept someone else's request", async () => {
    const res = await request(app)
      .post("/user/respond_to_connection_request")
      .send({
        token: senderToken,
        connectionReqId,
        action_type: "accept",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("should accept connection request", async () => {
    const res = await request(app)
      .post("/user/respond_to_connection_request")
      .send({
        token: receiverToken,
        connectionReqId,
        action_type: "accept",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Connection request updated successfully");
  });

  it("should return my sent requests", async () => {
    const res = await request(app).get("/user/get_connection_requests").query({
      token: senderToken,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.connectionRequests.length).toBe(1);
  });

  it("should reject a connection request", async () => {
    await request(app).post("/register").send({
      name: "Third User",
      username: "thirduser",
      email: "third@test.com",
      password: "password123",
    });

    const thirdLogin = await request(app).post("/login").send({
      email: "third@test.com",
      password: "password123",
    });

    await request(app).post("/user/send_connection_request").send({
      token: thirdLogin.body.token,
      targetUserId: receiverId,
    });

    const pending = await request(app)
      .get("/user/get_connection_requests_for_me")
      .query({
        token: receiverToken,
      });

    const pendingReq = pending.body.connectionRequests.find(
      (r) => !r.status_accepted,
    );

    const res = await request(app).post("/reject_connection").send({
      token: receiverToken,
      connectionReqId: pendingReq._id,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Connection request rejected");
  });

  it("should fail with invalid token", async () => {
    const res = await request(app).post("/user/send_connection_request").send({
      token: "invalidtoken",
      targetUserId: receiverId,
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  it("should fail when target user doesn't exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).post("/user/send_connection_request").send({
      token: senderToken,
      targetUserId: fakeId,
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Target user not found");
  });
  it("should not allow sending a connection request to yourself", async () => {
    const sender = await request(app).post("/login").send({
      email: "sender@test.com",
      password: "password123",
    });

    const res = await request(app).post("/user/send_connection_request").send({
      token: sender.body.token,
      targetUserId: sender.body.userId,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Cannot send request to yourself");
  });
});
