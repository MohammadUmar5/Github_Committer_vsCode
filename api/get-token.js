const { getStoredToken } = require("../oauth"); // Import getStoredToken from oauth.js

module.exports = async (req, res) => {
  try {
    const token = await getStoredToken(); // Assuming a function to get token from secret storage
    if (!token) {
      return res.status(404).send("Token not found.");
    }
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error retrieving token:", error.message);
    res.status(500).send("Failed to retrieve token.");
  }
};
