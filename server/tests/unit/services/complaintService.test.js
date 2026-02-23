import { jest } from "@jest/globals";
import mongoose from "mongoose";

const createComplaint = jest.fn();
const listComplaints = jest.fn();
const findComplaintById = jest.fn();
const updateComplaintById = jest.fn();
const deleteComplaintById = jest.fn();

jest.unstable_mockModule("../../../src/repositories/complaintRepository.js", () => ({
  createComplaint,
  listComplaints,
  findComplaintById,
  updateComplaintById,
  deleteComplaintById,
}));

const {
  submitComplaint,
  getComplaints,
  getComplaint,
  setComplaintStatus,
  setComplaintResponse,
  removeComplaint,
} = await import("../../../src/services/complaintService.js");
const { AppError } = await import("../../../src/utils/AppError.js");

const oid = () => new mongoose.Types.ObjectId().toString();

describe("complaintService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("submitComplaint requires subject and message", async () => {
    await expect(submitComplaint({})).rejects.toThrow(AppError);
  });

  test("submitComplaint rejects partial location", async () => {
    await expect(
      submitComplaint({
        userId: oid(),
        kind: "complaint",
        category: "general",
        subject: "s",
        message: "m",
        location: { lat: 10 },
      })
    ).rejects.toThrow("Invalid location");
  });

  test("submitComplaint stores normalized location", async () => {
    const id = oid();
    createComplaint.mockResolvedValue({
      _id: id,
      user: id,
      kind: "complaint",
      category: "general",
      subject: "s",
      message: "m",
      status: "pending",
      location: { coordinates: [20, 10], type: "Point", label: "here" },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await submitComplaint({
      userId: id,
      kind: "complaint",
      category: "general",
      subject: "s",
      message: "m",
      location: { lat: 10, lng: 20, label: "here" },
    });
    expect(createComplaint).toHaveBeenCalledWith(
      expect.objectContaining({
        location: {
          type: "Point",
          coordinates: [20, 10],
          label: "here",
        },
      })
    );
    expect(res.location).toMatchObject({ lat: 10, lng: 20, label: "here" });
  });

  test("getComplaints filters by user when not admin", async () => {
    listComplaints.mockResolvedValue([
      { _id: "1", user: "u1", kind: "complaint", category: "c", subject: "s", message: "m", status: "pending", createdAt: new Date(), updatedAt: new Date() },
    ]);
    const res = await getComplaints({ isAdmin: false, userId: "u1" });
    expect(listComplaints).toHaveBeenCalledWith({ user: "u1" });
    expect(res).toHaveLength(1);
  });

  test("getComplaint forbids when non-admin and not owner", async () => {
    const id = oid();
    findComplaintById.mockResolvedValue({ _id: id, user: "owner", toString: function () { return this._id; }, kind: "complaint", category: "c", subject: "s", message: "m", status: "pending" });
    await expect(
      getComplaint({ id, isAdmin: false, userId: "other" })
    ).rejects.toThrow("Forbidden");
  });

  test("setComplaintStatus rejects invalid status", async () => {
    const id = oid();
    await expect(
      setComplaintStatus({ id, status: "nope", adminId: oid() })
    ).rejects.toThrow("Invalid status");
  });

  test("setComplaintResponse requires text", async () => {
    const id = oid();
    await expect(
      setComplaintResponse({ id, text: "", adminId: oid() })
    ).rejects.toThrow("Response text required");
  });

  test("removeComplaint throws when not found", async () => {
    const id = oid();
    deleteComplaintById.mockResolvedValue(null);
    await expect(removeComplaint(id)).rejects.toThrow("Complaint not found");
  });

  test("setComplaintStatus resolves valid update", async () => {
    const id = oid();
    updateComplaintById.mockResolvedValue({
      _id: id,
      user: "u1",
      kind: "complaint",
      category: "general",
      subject: "s",
      message: "m",
      status: "resolved",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await setComplaintStatus({ id, status: "resolved", adminId: oid() });
    expect(res.status).toBe("resolved");
  });
});