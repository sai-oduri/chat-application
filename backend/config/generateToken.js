const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");

dotenv.config();

const generateToken = async (id) => {
    const token = await jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d"
    });

    return token;
}

module.exports = generateToken;