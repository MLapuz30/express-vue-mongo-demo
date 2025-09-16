import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  studentId: { type: Number, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  section: { type: String, required: true },
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

export default Student;