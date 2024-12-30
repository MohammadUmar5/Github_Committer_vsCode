const { getStoredToken } = require("../oauth"); // Import getStoredToken from oauth.js

module.exports = async (req, res) => {
  try {
    const token = await getStoredToken(req.context);  // Pass context here
    if (!token) {
      return res.status(400).json({
        error: "No token found."
      });
    }
    return res.status(200).json({
      token: token,
    });
  } catch (error) {
    console.error("Error retrieving token:", error.message);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
