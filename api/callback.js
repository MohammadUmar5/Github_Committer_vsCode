require("dotenv").config({ path: __dirname + "/../.env" });
const axios = require("axios");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect_uri = "https://github-committer-vs-code.vercel.app/api/callback";
const oauth_endpoint = "https://github-committer-vs-code.vercel.app/api/oauth_endpoint";

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
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri,
      },
      { headers: { Accept: "application/json" } }
    );

    const { access_token } = tokenResponse.data;
    if (!access_token) {
      return res.status(400).json({ error: "Failed to retrieve access token." });
    }

    // Send the token to the OAuth handler
    await axios.post(oauth_endpoint, { token: access_token });

    res.status(200).json({ message: "Authorization successful!" });
  } catch (error) {
    console.error("Error during OAuth process:", error.message);
    res.status(500).json({ error: "Error during OAuth process." });
  }
};
