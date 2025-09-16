import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  adminId: { type: Number, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  department: { type: String, required: true },
  profileImage: { type: String, required: false },
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;