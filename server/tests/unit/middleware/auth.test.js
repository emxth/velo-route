import { jest } from "@jest/globals";

const verify = jest.fn();
const findById = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { verify },
  verify,
}));

jest.unstable_mockModule("../../../src/models/User.js", () => ({
  User: { findById },
}));

const { protect, authorize } = await import("../../../src/middleware/auth.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("middleware/protect", () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rejects missing token", async () => {
    const req = { headers: {} };
    const res = mockRes();
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("accepts valid token", async () => {
    const req = { headers: { authorization: "Bearer tok" } };
    const res = mockRes();
    verify.mockReturnValue({ userId: "u1" });
    findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: "u1", role: "admin" }),
    });
    await protect(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  test("rejects invalid token", async () => {
    const req = { headers: { authorization: "Bearer tok" } };
    const res = mockRes();
    verify.mockImplementation(() => {
      throw new Error("bad");
    });
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe("middleware/authorize", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("forbids when role not allowed", () => {
    const req = { user: { role: "user" } };
    const res = mockRes();
    const next = jest.fn();
    authorize("admin")(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("passes when role allowed", () => {
    const req = { user: { role: "admin" } };
    const res = mockRes();
    const next = jest.fn();
    authorize("admin")(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
