require("dotenv").config({ path: __dirname + '/../.env' }); // Load environment variables from .env file
const axios = require("axios");
const vscode = require("vscode"); // Import vscode for message display

const CLIENT_ID = process.env.CLIENT_ID; // Use environment variables
const CLIENT_SECRET = process.env.CLIENT_SECRET; // Use environment variables

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
        redirect_uri: "https://github-committer-vs-code.vercel.app/api/callback"
      },
      {
        headers: {
          Accept: "application/json"
        }
      }
    );

    const { access_token } = tokenResponse.data;
    if (!access_token) {
      return res.status(400).send("Failed to retrieve access token.");
    }

    // Simulating storing the token, in a real scenario, this should interact with VSCode's secret storage
    // Note: This is where you would save the token to secret storage, in the actual VSCode environment
    await storeToken(access_token);

    res.status(200).send("Authorization successful. You can close this window.");
  } catch (error) {
    console.error("Error during token exchange:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

async function storeToken(token) {
  try {
    if (token) {
      console.log("Storing GitHub token in secret storage...");

      // In VSCode extension, you'd use context.secrets.store like so:
      await vscode.context.secrets.store("githubToken", token);
      vscode.window.showInformationMessage("GitHub token saved securely.");
    } else {
      console.error("No token provided to store.");
    }
  } catch (error) {
    console.error("Error storing token:", error.message);
  }
}
