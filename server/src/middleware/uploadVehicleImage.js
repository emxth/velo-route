import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "veloroute/vehicles",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, //2MB
});

export const uploadVehicleImage = upload.single("vehiclePhoto");
