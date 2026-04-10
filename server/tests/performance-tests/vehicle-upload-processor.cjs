const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

const imagePath = path.join(__dirname, "test-image.jpg");

if (!fs.existsSync(imagePath)) {
  const dummyBuffer = Buffer.from(
    "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwg...",
    "base64",
  );
  fs.writeFileSync(imagePath, dummyBuffer);
}

module.exports = {
  createVehicleWithImage: async (context, events) => {
    try {
      if (!context.vars.authToken) throw new Error("Missing auth token");
      if (!context.vars.deptId) throw new Error("Missing department ID");

      const form = new FormData();
      const registrationNumber = `CTB-${Math.floor(Math.random() * 100000)}`;

      form.append("registrationNumber", registrationNumber);
      form.append("category", "Bus");
      form.append("type", "Passenger");
      form.append("brand", "Ashok Leyland");
      form.append("model", "Viking");
      form.append("yearOfManufacture", "2021");
      form.append("seatCapacity", "55");
      form.append("department", context.vars.deptId);
      form.append("status", "AVAILABLE");

      form.append("insurance[provider]", "Sri Lanka Insurance");
      form.append("insurance[policyNumber]", `INS-${Date.now()}`);
      form.append("insurance[type]", "Comprehensive");
      form.append("insurance[startDate]", "2026-01-01");
      form.append("insurance[expiryDate]", "2027-01-01");

      form.append("fitness[certificateNumber]", `FIT-${Date.now()}`);
      form.append("fitness[issueDate]", "2026-01-01");
      form.append("fitness[expiryDate]", "2027-01-01");

      form.append("vehiclePhoto", fs.createReadStream(imagePath));

      const response = await axios.post(
        "http://localhost:5000/api/vehicles",
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${context.vars.authToken}`,
          },
          timeout: 5000,
        },
      );

      if (!response.data || !response.data._id) {
        throw new Error("Vehicle ID missing in response");
      }

      context.vars.vehicleId = response.data._id;

      // NO console.log here – keep it silent
      return;
    } catch (err) {
      // Keep error logs for debugging (they will appear in red)
      console.error("❌ VEHICLE CREATION ERROR");
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      } else {
        console.error(err.message);
      }
      context.vars.vehicleId = null;
      throw err;
    }
  },
};
