const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// -------------------- MONGODB CONNECTION --------------------
mongoose.connect(
    "mongodb+srv://yash:yash%40123@cluster0.uelkdir.mongodb.net/EMP?appName=Cluster0"
)
    .then(() => console.log("MongoDB Atlas Connected"))
    .catch(err => console.log("MongoDB Connection Error:", err));

// -------------------- EMPLOYEE SCHEMA --------------------
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    officecode: String,
    jobTitle: String,
    profile: String
});

const Employee = mongoose.model("Employee", employeeSchema);

// -------------------- GET ALL EMPLOYEES --------------------
app.get("/employees", async (req, res) => {
    try {
        const employees = await Employee.find(); // 👈 NO .select('-password')
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// -------------------- CREATE EMPLOYEE --------------------
app.post("/employees", async (req, res) => {
    try {
        const existingUser = await Employee.findOne({ email: req.body.email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const emp = new Employee({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password, // plain text (as you want)
            officecode: req.body.officecode,
            jobTitle: req.body.jobTitle,
            profile: req.body.profile
        });

        await emp.save();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// -------------------- UPDATE EMPLOYEE --------------------
app.put("/employees/:id", async (req, res) => {
    try {
        await Employee.findByIdAndUpdate(req.params.id, req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// -------------------- DELETE ONE EMPLOYEE --------------------
app.delete("/employees/:id", async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -------------------- DELETE ALL EMPLOYEES --------------------
app.delete("/employees", async (req, res) => {
    try {
        await Employee.deleteMany({});
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -------------------- LOGIN --------------------
app.post("/login", async (req, res) => {
    console.log("LOGIN BODY:", req.body);

    try {
        const { email, password } = req.body;

        // Find employee by email
        const employee = await Employee.findOne({ email });

        if (!employee) {
            return res.status(401).json({
                success: false,
                message: "Employee not found"
            });
        }

        // ❌ Plain text password comparison
        if (employee.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password"
            });
        }

        // ❗ Do not send password to frontend
        const empData = employee.toObject();
        delete empData.password;

        res.json({
            success: true,
            employee: empData
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});



// -------------------- START SERVER --------------------
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));