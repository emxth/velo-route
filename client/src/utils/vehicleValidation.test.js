import { validateVehicleForm } from "./vehicleValidation";

describe("validateVehicleForm", () => {
  const validForm = {
    registrationNumber: "WP-ABC-1234",
    category: "Bus",
    type: "Passenger",
    brand: "Mercedes",
    model: "Sprinter",
    yearOfManufacture: 2021,
    seatCapacity: 40,
    department: "507f1f77bcf86cd799439011",
    insurance: {
      provider: "ABC Insurance",
      policyNumber: "POL123",
      startDate: "2024-01-01",
      expiryDate: "2030-01-01",
    },
    fitness: {
      certificateNumber: "FIT123",
      issueDate: "2024-01-01",
      expiryDate: "2030-01-01",
    },
  };

  test("accepts a valid vehicle form", () => {
    expect(validateVehicleForm(validForm)).toEqual({});
  });

  test("requires registration number", () => {
    const errors = validateVehicleForm({
      ...validForm,
      registrationNumber: "",
    });

    expect(errors.registrationNumber).toMatch(/required/i);
  });

  test("rejects invalid category", () => {
    const errors = validateVehicleForm({
      ...validForm,
      category: "Plane",
    });

    expect(errors.category).toMatch(/Bus or Train/i);
  });
});
