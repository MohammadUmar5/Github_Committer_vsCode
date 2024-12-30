require("dotenv").config({ path: __dirname + "/../.env" });

const { getStoredToken } = require("../oauth"); // Import getStoredToken from oauth.js

module.exports = async (req, res) => {
  try {
    // Simulate a serverless function context for token storage.
    const context = {
      secrets: {
        get: async (key) => {
          // Replace this with your token storage mechanism, e.g., from a database or .env
          const token = process.env.GITHUB_TOKEN; // For example, using an env variable
          return key === "githubToken" ? token : null;
        },
      },
    };

    // Retrieve the token using the simulated context
    const token = await getStoredToken(context);
    if (!token) {
      return res.status(400).json({
        error: "No token found.",
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
