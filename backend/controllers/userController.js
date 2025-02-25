const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
    try {
        const { name, password } = req.body;
        if (!name || !password) return res.status(400).json({ message: "Name and password required" });

        const existingUser = await User.findOne({ name });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User created" });
    } catch (error) {
        res.status(500).json({ message: "Error occurred", error: error.message });
    }
};

exports.signin = async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await User.findOne({ name });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id, name }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: "SignIn successful", token });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
