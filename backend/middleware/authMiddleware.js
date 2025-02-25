const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    console.log("Token received:", token);  // Debugging line

    if (!token) {
        return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            console.error("JWT Verification Error:", err.message);
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticate;
