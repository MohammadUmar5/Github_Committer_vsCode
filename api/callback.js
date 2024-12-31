require("dotenv").config({ path: __dirname + "/../.env" });
const axios = require("axios");

let temporaryToken = null;  // Store token temporarily

const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is missing." });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
        redirect_uri: "https://github-committer-vs-code.vercel.app/api/callback", // Ensure this is the correct callback URL
      },
      { headers: { Accept: "application/json" } }
    );

    const { access_token } = tokenResponse.data;
    if (!access_token) {
      return res.status(400).json({ error: "Failed to retrieve access token." });
    }

    temporaryToken = access_token;  // Store the token temporarily in memory
    res.status(200).json({ message: "Authorization successful!" });
  } catch (error) {
    console.error("Error during OAuth process:", error.message);
    res.status(500).json({ error: "Error during OAuth process." });
  }
};

// You can access the token directly when VS Code extension makes a request to /api/callback
module.exports.getToken = async (req, res) => {
  if (temporaryToken) {
    return res.json({ token: temporaryToken });  // Return the temporary token
  }

  res.status(404).json({ error: "Token not found" });
};
