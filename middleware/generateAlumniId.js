const Counter = require("../models/Counter");

exports.generateAlumniId = async (req, res, next) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "alumniId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    const alumniId = `PSGPS-ALU-${String(counter.seq).padStart(6, "0")}`;

    req.alumniId = alumniId;

    next();
  } catch (error) {
    next(error);
  }
};
