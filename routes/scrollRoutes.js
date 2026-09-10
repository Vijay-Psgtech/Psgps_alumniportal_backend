// backend/routes/notificationRoutes.js
const express = require("express");
const NotificationScroll = require("../models/scroll");
const { authMiddleware, superAdminMiddleware } = require("../middleware/auth");
const router = express.Router();

// ✅ GET active notifications (PUBLIC)
router.get("/active", async (req, res) => {
  try {
    const notifications = await NotificationScroll.find({ 
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    }).sort({ displayOrder: 1, createdAt: -1 });

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching active notifications:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET all notifications (ADMIN ONLY)
router.get("/", authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const notifications = await NotificationScroll.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ CREATE notification (ADMIN ONLY)
router.post("/", authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const { message, type, title, expiresAt } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const notification = new NotificationScroll({
      message,
      type: type || "info",
      title: title || "",
      expiresAt: expiresAt || null,
      isActive: false,
      displayOrder: 0,
      createdBy: req.user.id
    });

    await notification.save();
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE notification (ADMIN ONLY)
router.put("/:id", authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const notification = await NotificationScroll.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET single notification (ADMIN ONLY)
router.get("/:id", authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const notification = await NotificationScroll.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ ACTIVATE notification (ADMIN ONLY)
router.patch("/:id/activate", authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const notification = await NotificationScroll.findByIdAndUpdate(
      req.params.id,
      { isActive: true, updatedAt: Date.now() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error("Error activating notification:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DEACTIVATE notification (ADMIN ONLY)
router.patch("/:id/deactivate", authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const notification = await NotificationScroll.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error("Error deactivating notification:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE notification (ADMIN ONLY)
router.delete("/:id", authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const notification = await NotificationScroll.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ TRACK NOTIFICATION VIEW (PUBLIC)
router.patch("/:id/view", async (req, res) => {
  try {
    const notification = await NotificationScroll.findByIdAndUpdate(
      req.params.id,
      { $inc: { "metadata.viewCount": 1 } },
      { new: true }
    );

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error("Error tracking view:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ TRACK NOTIFICATION DISMISS (PUBLIC)
router.patch("/:id/dismiss", async (req, res) => {
  try {
    const notification = await NotificationScroll.findByIdAndUpdate(
      req.params.id,
      { $inc: { "metadata.dismissCount": 1 } },
      { new: true }
    );

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error("Error tracking dismiss:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;