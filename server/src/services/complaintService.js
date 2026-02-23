import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";
import {
  createComplaint,
  listComplaints,
  findComplaintById,
  updateComplaintById,
  deleteComplaintById,
} from "../repositories/complaintRepository.js";

const ensureValidId = (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid complaint id", 400);
  }
};

const shape = (doc) =>
  doc && {
    id: doc._id,
    user: doc.user,
    kind: doc.kind,
    category: doc.category,
    subject: doc.subject,
    message: doc.message,
    status: doc.status,
    response: doc.response,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

export const submitComplaint = async ({ userId, kind, category, subject, message }) => {
  if (!subject || !message) throw new AppError("Subject and message are required", 400);
  const doc = await createComplaint({
    user: userId,
    kind,
    category,
    subject,
    message,
  });
  return shape(doc);
};

export const getComplaints = async ({ isAdmin, userId }) => {
  const filter = isAdmin ? {} : { user: userId };
  const docs = await listComplaints(filter);
  return docs.map(shape);
};

export const getComplaint = async ({ id, isAdmin, userId }) => {
  ensureValidId(id);
  const doc = await findComplaintById(id);
  if (!doc) throw new AppError("Complaint not found", 404);
  if (!isAdmin && doc.user.toString() !== userId.toString()) {
    throw new AppError("Forbidden", 403);
  }
  return shape(doc);
};

export const setComplaintStatus = async ({ id, status, adminId }) => {
  ensureValidId(id);
  if (!["pending", "resolved"].includes(status)) throw new AppError("Invalid status", 400);
  const updated = await updateComplaintById(id, { status });
  if (!updated) throw new AppError("Complaint not found", 404);
  return shape(updated);
};

export const setComplaintResponse = async ({ id, text, adminId }) => {
  ensureValidId(id);
  if (!text) throw new AppError("Response text required", 400);
  const updated = await updateComplaintById(id, {
    response: { text, respondedBy: adminId, respondedAt: new Date() },
  });
  if (!updated) throw new AppError("Complaint not found", 404);
  return shape(updated);
};

export const removeComplaint = async (id) => {
  ensureValidId(id);
  const deleted = await deleteComplaintById(id);
  if (!deleted) throw new AppError("Complaint not found", 404);
  return true;
};