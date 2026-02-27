import {
  submitComplaint,
  getComplaints,
  getComplaint,
  setComplaintStatus,
  setComplaintResponse,
  removeComplaint,
} from "../services/complaintService.js";

// Controller layer handles HTTP requests

// Create complaint
export const createComplaint = async (req, res, next) => {
  try {
    const payload = await submitComplaint({
      userId: req.user._id,
      kind: "complaint",
      category: req.body.category,
      subject: req.body.subject,
      message: req.body.message,
      location: req.body.location,
    });
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
};

// Create feedback
export const createFeedback = async (req, res, next) => {
  try {
    const payload = await submitComplaint({
      userId: req.user._id,
      kind: "feedback",
      category: req.body.category,
      subject: req.body.subject,
      message: req.body.message,
      location: req.body.location,
    });
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
};

// List complaints
export const listComplaints = async (req, res, next) => {
  try {
    const payload = await getComplaints({
      isAdmin: req.user.role === "admin",
      userId: req.user._id,
    });
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// Get single complaint
export const getComplaintById = async (req, res, next) => {
  try {
    const payload = await getComplaint({
      id: req.params.id,
      isAdmin: req.user.role === "admin",
      userId: req.user._id,
    });
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// Update status (admin)
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const payload = await setComplaintStatus({
      id: req.params.id,
      status: req.body.status,
      adminId: req.user._id,
    });
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// Add admin response (admin)
export const updateComplaintResponse = async (req, res, next) => {
  try {
    const payload = await setComplaintResponse({
      id: req.params.id,
      text: req.body.text,
      adminId: req.user._id,
    });
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// Delete complaint (admin)
export const deleteComplaint = async (req, res, next) => {
  try {
    await removeComplaint(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};