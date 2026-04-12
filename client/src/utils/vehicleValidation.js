// utils/vehicleValidation.js

// Helper to get today's date (YYYY-MM-DD) without time
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export const validateVehicleForm = (formData, isUpdate = false) => {
  const errors = {};
  const today = getTodayDate();

  // Registration number
  if (!isUpdate || formData.registrationNumber) {
    if (!formData.registrationNumber?.trim())
      errors.registrationNumber = "Registration number is required";
    else if (!/^[A-Z0-9-]+$/.test(formData.registrationNumber))
      errors.registrationNumber =
        "Only uppercase letters, numbers, and hyphens allowed";
  }

  // Category & Type
  if (!isUpdate || formData.category) {
    if (!formData.category) errors.category = "Category is required";
    else if (!["Bus", "Train"].includes(formData.category))
      errors.category = "Must be Bus or Train";
  }

  if (!isUpdate || formData.type) {
    if (!formData.type) errors.type = "Type is required";
    else if (!["Passenger", "Cargo"].includes(formData.type))
      errors.type = "Must be Passenger or Cargo";
  }

  // Brand & Model
  if (!isUpdate || formData.brand) {
    if (!formData.brand?.trim()) errors.brand = "Brand is required";
    else if (formData.brand.trim().length < 2)
      errors.brand = "Brand must be at least 2 characters";
  }

  if (!isUpdate || formData.model) {
    if (!formData.model?.trim()) errors.model = "Model is required";
  }

  // Year of manufacture
  if (!isUpdate || formData.yearOfManufacture) {
    if (!formData.yearOfManufacture)
      errors.yearOfManufacture = "Year is required";
    else {
      const year = parseInt(formData.yearOfManufacture);
      const currentYear = new Date().getFullYear();
      if (year < 2000 || year > currentYear)
        errors.yearOfManufacture = `Year must be between 2000 and ${currentYear}`;
    }
  }

  // ----- CAPACITY VALIDATION -----
  if (formData.type === "Passenger") {
    if (!formData.seatCapacity || formData.seatCapacity === "") {
      errors.seatCapacity = "Seat capacity is required";
    } else {
      const seats = Number(formData.seatCapacity);
      if (isNaN(seats) || seats < 1) {
        errors.seatCapacity = "Seat capacity must be at least 1";
      } else if (seats > 60) {
        errors.seatCapacity = "Seat capacity cannot exceed 60";
      }
    }
  } else if (formData.type === "Cargo") {
    if (!formData.cargoCapacityKg || formData.cargoCapacityKg === "") {
      errors.cargoCapacityKg = "Cargo capacity is required";
    } else {
      const cargo = Number(formData.cargoCapacityKg);
      if (isNaN(cargo) || cargo < 500) {
        errors.cargoCapacityKg = "Cargo capacity must be at least 500 kg";
      } else if (cargo > 50000) {
        errors.cargoCapacityKg = "Cargo capacity cannot exceed 50,000 kg";
      }
    }
  }

  // Department
  if (!isUpdate || formData.department) {
    if (!formData.department) errors.department = "Department is required";
  }

  // Status – required for update
  if (isUpdate) {
    if (
      !formData.status ||
      !["AVAILABLE", "UNDER MAINTENANCE", "UNAVAILABLE"].includes(
        formData.status,
      )
    ) {
      errors.status = "Status is required";
    }
  }

  // Insurance
  if (!isUpdate || formData.insurance?.provider) {
    if (!formData.insurance?.provider?.trim())
      errors["insurance.provider"] = "Insurance provider required";
  }
  if (!isUpdate || formData.insurance?.policyNumber) {
    if (!formData.insurance?.policyNumber?.trim())
      errors["insurance.policyNumber"] = "Policy number required";
  }
  if (!isUpdate || formData.insurance?.startDate) {
    if (!formData.insurance?.startDate)
      errors["insurance.startDate"] = "Start date required";
    else if (formData.insurance.startDate > today)
      errors["insurance.startDate"] = "Start date cannot be in the future";
  }
  if (!isUpdate || formData.insurance?.expiryDate) {
    if (!formData.insurance?.expiryDate)
      errors["insurance.expiryDate"] = "Expiry date required";
    else if (formData.insurance.expiryDate <= today)
      errors["insurance.expiryDate"] = "Expiry date must be in the future";
  }
  if (formData.insurance?.startDate && formData.insurance?.expiryDate) {
    if (
      new Date(formData.insurance.startDate) >=
      new Date(formData.insurance.expiryDate)
    )
      errors["insurance.expiryDate"] = "Expiry must be after start date";
  }

  // Fitness
  if (!isUpdate || formData.fitness?.certificateNumber) {
    if (!formData.fitness?.certificateNumber?.trim())
      errors["fitness.certificateNumber"] = "Certificate number required";
  }
  if (!isUpdate || formData.fitness?.issueDate) {
    if (!formData.fitness?.issueDate)
      errors["fitness.issueDate"] = "Issue date required";
    else if (formData.fitness.issueDate > today)
      errors["fitness.issueDate"] = "Issue date cannot be in the future";
  }
  if (!isUpdate || formData.fitness?.expiryDate) {
    if (!formData.fitness?.expiryDate)
      errors["fitness.expiryDate"] = "Expiry date required";
    else if (formData.fitness.expiryDate <= today)
      errors["fitness.expiryDate"] = "Expiry date must be in the future";
  }
  if (formData.fitness?.issueDate && formData.fitness?.expiryDate) {
    if (
      new Date(formData.fitness.issueDate) >=
      new Date(formData.fitness.expiryDate)
    )
      errors["fitness.expiryDate"] = "Expiry must be after issue date";
  }

  // Maintenance (optional)
  if (formData.lastMaintenance?.date) {
    if (formData.lastMaintenance.date > today)
      errors["lastMaintenance.date"] =
        "Last maintenance date cannot be in the future";
  }
  if (formData.nextMaintenanceDue?.date) {
    if (formData.nextMaintenanceDue.date <= today)
      errors["nextMaintenanceDue.date"] =
        "Next maintenance due date must be in the future";
  }
  if (formData.nextMaintenanceDue?.date && formData.lastMaintenance?.date) {
    if (
      new Date(formData.nextMaintenanceDue.date) <=
      new Date(formData.lastMaintenance.date)
    )
      errors["nextMaintenanceDue.date"] =
        "Next maintenance must be after last maintenance";
  }

  // ✅ NEW: Odometer validation (if both odometer values are provided)
  if (
    formData.lastMaintenance?.odometer !== undefined &&
    formData.lastMaintenance?.odometer !== "" &&
    formData.nextMaintenanceDue?.odometer !== undefined &&
    formData.nextMaintenanceDue?.odometer !== ""
  ) {
    const lastOdo = Number(formData.lastMaintenance.odometer);
    const nextOdo = Number(formData.nextMaintenanceDue.odometer);
    if (!isNaN(lastOdo) && !isNaN(nextOdo) && nextOdo <= lastOdo) {
      errors["nextMaintenanceDue.odometer"] =
        "Next maintenance odometer must be greater than last maintenance odometer";
    }
  }

  return errors;
};
