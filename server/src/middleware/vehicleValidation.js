import { AppError } from "../utils/AppError.js";

export const validateVehicle = (req, res, next) => {
  const {
    registrationNumber,
    category,
    type,
    brand,
    model,
    yearOfManufacture,
    seatCapacity,
    cargoCapacityKg,
    department,
    insurance,
    fitness,
    status,
  } = req.body;

  const errors = [];

  if (req.method === "POST") {
    // Required fields for POST
    if (!registrationNumber || !/^[A-Z0-9-]+$/.test(registrationNumber)) {
      errors.push(
        "Registration number is required and can only contain uppercase letters, numbers, and hyphens",
      );
    }

    if (!category || !["Bus", "Train"].includes(category)) {
      errors.push("Category is required and must be either Bus or Train");
    }

    if (!type || !["Passenger", "Cargo"].includes(type)) {
      errors.push("Type is required and must be either Passenger or Cargo");
    }

    if (!brand || brand.trim().length < 2) {
      errors.push("Brand is required and must be at least 2 characters");
    }

    if (!model || model.trim().length < 1) {
      errors.push("Model is required");
    }

    if (!yearOfManufacture) {
      errors.push("Year of manufacture is required");
    } else {
      const currentYear = new Date().getFullYear();
      if (yearOfManufacture < 2000 || yearOfManufacture > currentYear) {
        errors.push(
          `Year of manufacture must be between 2000 and ${currentYear}`,
        );
      }
    }

    // Conditional validation based on type
    if (type === "Passenger" && (!seatCapacity || seatCapacity < 1)) {
      errors.push(
        "Seat capacity is required and must be at least 1 for passenger vehicles",
      );
    }

    if (type === "Cargo" && (!cargoCapacityKg || cargoCapacityKg < 500)) {
      errors.push(
        "Cargo capacity is required and must be at least 500 kg for cargo vehicles",
      );
    }

    if (!department) {
      errors.push("Department is required");
    }

    // Insurance validation
    if (!insurance?.provider) errors.push("Insurance provider is required");
    if (!insurance?.policyNumber)
      errors.push("Insurance policy number is required");
    if (!insurance?.startDate) errors.push("Insurance start date is required");
    if (!insurance?.expiryDate)
      errors.push("Insurance expiry date is required");

    // Fitness validation
    if (!fitness?.certificateNumber)
      errors.push("Fitness certificate number is required");
    if (!fitness?.issueDate) errors.push("Fitness issue date is required");
    if (!fitness?.expiryDate) errors.push("Fitness expiry date is required");
  }

  if (req.method === "PUT") {
    // PUT: Optional fields with validation if provided
    if (registrationNumber && !/^[A-Z0-9-]+$/.test(registrationNumber)) {
      errors.push(
        "Registration number can only contain uppercase letters, numbers, and hyphens",
      );
    }

    if (category && !["Bus", "Train"].includes(category)) {
      errors.push("Category must be either Bus or Train");
    }

    if (type && !["Passenger", "Cargo"].includes(type)) {
      errors.push("Type must be either Passenger or Cargo");
    }

    if (brand && brand.trim().length < 2) {
      errors.push("Brand must be at least 2 characters");
    }

    if (yearOfManufacture) {
      const currentYear = new Date().getFullYear();
      if (yearOfManufacture < 2000 || yearOfManufacture > currentYear) {
        errors.push(
          `Year of manufacture must be between 2000 and ${currentYear}`,
        );
      }
    }

    if (seatCapacity !== undefined && seatCapacity < 1) {
      errors.push("Seat capacity must be at least 1");
    }

    if (cargoCapacityKg !== undefined && cargoCapacityKg < 1) {
      errors.push("Cargo capacity must be at least 1 kg");
    }

    if (
      status &&
      !["AVAILABLE", "UNDER MAINTENANCE", "UNAVAILABLE"].includes(status)
    ) {
      errors.push(
        "Status must be AVAILABLE, UNDER MAINTENANCE, or UNAVAILABLE",
      );
    }

    // Insurance date validation if both dates are provided
    if (insurance?.startDate && insurance?.expiryDate) {
      if (new Date(insurance.startDate) >= new Date(insurance.expiryDate)) {
        errors.push("Insurance expiry date must be after start date");
      }
    }

    // Fitness date validation if both dates are provided
    if (fitness?.issueDate && fitness?.expiryDate) {
      if (new Date(fitness.issueDate) >= new Date(fitness.expiryDate)) {
        errors.push("Fitness expiry date must be after issue date");
      }
    }
  }

  if (errors.length > 0) {
    return next(new AppError("Validation failed", 400, { errors }));
  }

  next();
};
