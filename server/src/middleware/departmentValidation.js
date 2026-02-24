import { AppError } from "../utils/AppError.js";

export const validateDepartment = (req, res, next) => {
  const { name, managerName, contactNumber, email, address, region } = req.body;
  const errors = [];

  if (req.method === "POST") {
    if (!name || name.trim().length < 2) {
      errors.push(
        "Department name is required and must be at least 2 characters",
      );
    }

    if (!managerName || managerName.trim().length < 2) {
      errors.push("Manager name is required and must be at least 2 characters");
    }

    if (!contactNumber || !/^[0-9]{10}$/.test(contactNumber)) {
      errors.push("Please enter a valid 10-digit number");
    }

    if (
      !email ||
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      errors.push("Please enter a valid email address");
    }

    if (!address || address.trim().length < 5) {
      errors.push("Address is required");
    }

    if (!region) {
      errors.push("Region is required");
    }
  }

  if (req.method === "PUT") {
<<<<<<< Updated upstream
    // PUT: Only update managerName, contactNumber, email, address
=======
>>>>>>> Stashed changes
    if (managerName && managerName.trim().length < 2) {
      errors.push("Manager name must be at least 2 characters");
    }

    if (contactNumber && !/^[0-9]{10}$/.test(contactNumber)) {
      errors.push("Please enter a valid 10-digit number");
    }

    if (
      email &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      errors.push("Please enter a valid email address");
    }

    if (address && address.trim().length < 5) {
      errors.push("Address is required");
    }
  }

  if (errors.length > 0) {
<<<<<<< Updated upstream
    // FIX: Pass a proper AppError object
=======
>>>>>>> Stashed changes
    return next(new AppError("Validation failed", 400, { errors }));
  }

  // Validation passed → continue
  next();
};
