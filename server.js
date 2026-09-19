const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/Users");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5000",
  "https://alumnitestpsgcas.psginstitutions.in",
  "https://alumni.psgcas.ac.in",
  "https://www.alumni.psgcas.ac.in",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (_req, res) =>
  res.json({ message: "Server is running", status: "OK" }),
);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/departments", require("./routes/departments"));
app.use("/api/alumni/chapters", require("./routes/chapters"));
app.use("/api/alumni", require("./routes/alumni"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/admin/dashboard", require("./routes/adminDash"));
app.use("/api/events", require("./routes/events"));
app.use("/api/albums", require("./routes/albums"));
app.use("/api/newsletters", require("./routes/newsletters"));
app.use("/api/donations", require("./routes/donation"));
app.use("/api/alumni-notifications", require("./routes/notifications"));
app.use("/api/notification-scrolls", require("./routes/scrollRoutes"));
app.use("/api/reports", require("./routes/adminReports"));
app.use("/api/users", require("./routes/users"));
app.use("/api/banner", require("./routes/bannerRoutes"));
app.use("/api/campaigns", require("./routes/campaigns"));

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

const seedDefaultAdmin = async () => {
  const adminEmail = (
    process.env.DEFAULT_ADMIN_EMAIL || "admin@psgps.edu.in"
  ).toLowerCase();
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123";

  try {
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`✅ Default admin already exists: ${adminEmail}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await User.create({
      firstName: "PSGPS",
      lastName: "Admin",
      name: "PSGPS Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "superadmin",
      department: "Administration",
      isActive: true,
      isApproved: true,
    });

    console.log(`✅ Seeded default superadmin account: ${adminEmail}`);
  } catch (error) {
    console.error("Failed to seed default admin:", error.message);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await seedDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`\n🚀 PSG Alumni Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
};

startServer();
