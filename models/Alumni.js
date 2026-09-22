const mongoose = require("mongoose");

const AlumniSchema = new mongoose.Schema(
  {
    alumniId: {
      type: String,
      unique: true,
      required: true,
    },
    // Basic Info
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    occupation: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    stream: {
      type: String,
      trim: true,
    },
    batchYear: {
      type: String,
      required: [true, "Batch year is required"],
    },

    // Location Information (for Alumni Map)
    country: {
      type: String,
    },
    city: {
      type: String,
    },

    fullAddress: {
      type: String,
    },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    // Status
    isApproved: {
      type: Boolean,
      default: false, // New registrations pending approval
    },

    currentPhoto: { type: String },

    role: {
      type: String,
      enum: ["Alumni", "Faculty", "Student", "Admin"],
      default: "Alumni",
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  },
);

AlumniSchema.index({ location: "2dsphere" }); // Geospatial index for location
AlumniSchema.index({ batchYear: 1 });
AlumniSchema.index({ isApproved: 1 }); // Index for filtering approved alumni

module.exports = mongoose.model("Alumni", AlumniSchema);
