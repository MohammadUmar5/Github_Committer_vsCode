require("dotenv").config({ path: __dirname + '/../.env' }); // Load environment variables from .env file
const axios = require("axios");       

module.exports = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      error: "Authorization code is missing in the request",
    });
  }

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
        redirect_uri:
          "https://github-committer-vs-code.vercel.app/api/callback",
      },
      { headers: { Accept: "application/json" } }
    );

    if (tokenResponse.data.error) {
      return res.status(500).json({
        error: `GitHub Error: ${tokenResponse.data.error_description}`,
      });
    }

    const accessToken = tokenResponse.data.access_token;

    // Save token to a database or secret storage (example in your case)
    // Save access token securely here

    return res.status(200).json({
      message: "Authorization successful! You can close this window.",
      token: accessToken,
    });
  } catch (error) {
    console.error("Error during token exchange:", error.message);
    return res.status(500).json({
      error: "Error during OAuth process.",
    });
  }
};
