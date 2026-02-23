import { Complaint } from "../models/Complaint.js";

export const createComplaint = (data) => Complaint.create(data);

export const listComplaints = (filter = {}) =>
  Complaint.find(filter).sort({ createdAt: -1 });

export const findComplaintById = (id) => Complaint.findById(id);

export const updateComplaintById = (id, update) =>
  Complaint.findByIdAndUpdate(id, update, { new: true });

export const deleteComplaintById = (id) => Complaint.findByIdAndDelete(id);