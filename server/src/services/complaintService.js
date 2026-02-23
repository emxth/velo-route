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

const normalizeLocation = (loc) => {
  if (!loc) return undefined;
  const latRaw = loc.lat ?? loc.latitude;
  const lngRaw = loc.lng ?? loc.longitude;

  // Only accept when both are provided (allow 0)
  const hasLat = latRaw !== undefined && latRaw !== null && latRaw !== "";
  const hasLng = lngRaw !== undefined && lngRaw !== null && lngRaw !== "";
  if (!hasLat && !hasLng) return undefined;      // no location provided
  if (!hasLat || !hasLng) throw new AppError("Invalid location", 400);

  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (Number.isNaN(lat) || Number.isNaN(lng)) throw new AppError("Invalid location", 400);

  return {
    type: "Point",
    coordinates: [lng, lat],
    label: loc.label || loc.name || undefined,
  };
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
    location: doc.location
      ? {
        lat: doc.location.coordinates?.[1],
        lng: doc.location.coordinates?.[0],
        label: doc.location.label,
      }
      : undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

export const submitComplaint = async ({ userId, kind, category, subject, message, location }) => {
  if (!subject || !message) throw new AppError("Subject and message are required", 400);
  const doc = await createComplaint({
    user: userId,
    kind,
    category,
    subject,
    message,
    location: normalizeLocation(location),
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