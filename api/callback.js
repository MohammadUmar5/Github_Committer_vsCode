const axios = require("axios");
const { CLIENT_ID, CLIENT_SECRET } = process.env; // Use environment variables
const { storeToken } = require("../oauth"); // Import storeToken from oauth.js

module.exports = async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send("Authorization code missing.");
  }

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: "https://github-committer-vs-code.vercel.app/api/callback",
      },
      { headers: { Accept: "application/json" } }
    );

    if (tokenResponse.data.error) {
      console.error("GitHub Error:", tokenResponse.data.error_description);
      return res.status(500).send("Authorization failed. Please try again.");
    }

    const token = tokenResponse.data.access_token;
    console.log("GitHub Access Token:", token);

    // Save token in the secret storage (for the extension)
    await storeToken(token); // This assumes storeToken is modified to store in Vercel's secret store

    res.status(200).send("Authorization successful! You can close this window.");
  } catch (error) {
    console.error("Error during token exchange:", error.message);
    res.status(500).send("Error during token exchange.");
  }
};
