import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import Admin from './models/Admin.js';
import Student from './models/Student.js';
import fs from "fs";

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')));

// Mongodb connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

const apiRouter = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Serve uploads folder statically
app.use("/uploads", express.static("uploads"));


// ========== STUDENT USERS ========== //

// REGISTER NEW STUDENT
apiRouter.post('/studentForm', async (req, res) => {
  try {
    const { studentId, firstName, lastName, section } = req.body;
    if (!studentId || !firstName || !lastName || !section) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }
    const newStudent = new Student({ studentId, firstName, lastName, section });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating note', error: error.message });
  }
});

// READ ALL STUDENTS 
apiRouter.get('/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
});

// READ A SINGLE STUDENT BY ID
apiRouter.get('/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching note', error: error.message });
    }
});

// UPDATE A STUDENT BY ID
apiRouter.put('/students/:id', async (req, res) => {
  try {
    const { studentId, firstName, lastName, section } = req.body;
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id, 
      { studentId, firstName, lastName, section },
      { new: true, runValidators: true } // {new: true} returns the updated document
    );
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
});

// DELETE A STUDENT BY ID
apiRouter.delete('/students/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});

// ========== ADMIN USERS ========== //

// REGISTER NEW ADMIN
apiRouter.post("/adminForm", upload.single("file"), async (req, res) => {
  try {
    const { adminId, firstName, lastName, department } = req.body;

    if (!adminId || !firstName || !lastName || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Multer saves the file, so get the path
    const profileImage = req.file ? req.file.path : null;

    const newAdmin = new Admin({
      adminId,
      firstName,
      lastName,
      department,
      profileImage,
    });

    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ message: "Error creating admin", error: error.message });
  }
});

// READ ALL ADMIN 
apiRouter.get('/admins', async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
});

// READ A SINGLE ADMIN BY ID
apiRouter.get('/admins/:id', async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching note', error: error.message });
    }
});

// UPDATE A ADMIN BY ID
apiRouter.put('/admins/:id', upload.single("file"), async (req, res) => {
  try {
    const { adminId, firstName, lastName, department } = req.body;

    // Build update object dynamically
    const updateData = { adminId, firstName, lastName, department };

    // If new file uploaded, update profileImage field
    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json(updatedAdmin);
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin', error: error.message });
  }
});

// DELETE A ADMIN BY ID
apiRouter.delete('/admins/:id', async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});

// Use the router for all paths starting with /api
app.use('/api', apiRouter);

// 5. START THE SERVER
// =================================
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
