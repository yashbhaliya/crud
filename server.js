const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

mongoose.connect(
"mongodb+srv://yash:yash%40123@cluster0.uelkdir.mongodb.net/EMP?appName=Cluster0")
    .then(() => console.log("MongoDB Atlas Connected"))
    .catch(err => console.log("MongoDB Connection Error:", err));

/* EMPLOYEE */
const employeeSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    officecode: String,
    jobTitle: String,
    profile: String
});
const Employee = mongoose.model("Employee", employeeSchema);

/* GET ALL EMPLOYEES */
app.get("/employees", async (req, res) => {
    try {
        const employees = await Employee.find().select('-password');
        res.json(employees);
    } catch (err) {
        res.status(500).json(err);
    }
});

/* CREATE EMPLOYEE */
app.post("/employees", async (req, res) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        const emp = new Employee({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            officecode: req.body.officecode,
            jobTitle: req.body.jobTitle,
            profile: req.body.profile
        });

        const savedEmp = await emp.save();
        res.json({ success: true, id: savedEmp._id });
    } catch (err) {
        res.status(500).json(err);
    }
});

// /* UPDATE EMPLOYEE */
// app.put("/employees/:id", async (req, res) => {
//     try {
//         console.log("Updating employee with id:", req.params.id);
//         console.log("Update data:", req.body);
//         const result = await Employee.findOneAndUpdate(
//             { _id: req.params.id },
//             req.body
//         );
//         console.log("Update result:", result);
//         res.json({ success: true });
//     } catch (err) {
//         console.log("Update error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

app.put("/employees/:id", async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.body.password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(req.body.password, saltRounds);
        }
        await Employee.findByIdAndUpdate(req.params.id, updateData);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* DELETE ONE EMPLOYEE */
app.delete("/employees/:id", async (req, res) => {
    try {
        await Employee.findOneAndDelete({ _id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json(err);
    }
});

/* DELETE ALL EMPLOYEES */
app.delete("/employees", async (req, res) => {
    try {
        await Employee.deleteMany({});
        res.json({ success: true });
    } catch (err) {
        res.status(500).json(err);
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
