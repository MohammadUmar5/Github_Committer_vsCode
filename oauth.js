const vscode = require("vscode");
const axios = require("axios");
require("dotenv").config();

const client_id = process.env.CLIENT_ID; // Loaded from .env
const client_secret = process.env.CLIENT_SECRET; // Loaded from .env
const redirect_uri = "http://localhost:3000/callback"; // Default fallback

let accessToken = null;

async function authorizeWithGitHub() {
  const storedToken = await getStoredToken();
  if (storedToken) {
    accessToken = storedToken;
    vscode.window.showInformationMessage("Using stored GitHub token.");
    return;
  }

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo`;
  vscode.env.openExternal(vscode.Uri.parse(authUrl));

  vscode.window.showInformationMessage(
    "Please complete authorization in your browser."
  );

  const express = require("express");
  const app = express();

  return new Promise((resolve, reject) => {
    const server = app.listen(3000, () => {
      console.log("OAuth server listening on port 3000");
    });
    app.get("/callback", async (req, res) => {
      const code = req.query.code;
      console.log("Authorization Code Received:", code);

      try {
        const tokenResponse = await axios.post(
          "https://github.com/login/oauth/access_token",
          {
            client_id: client_id,
            client_secret: client_secret,
            code,
            redirect_uri: redirect_uri, // Optional, only needed if set in GitHub app
          },
          {
            headers: { Accept: "application/json" },
          }
        );

        console.log("Token Response:", tokenResponse.data);

        if (tokenResponse.data.error) {
          console.error("GitHub Error:", tokenResponse.data.error_description);
          res.send("Authorization failed. Please try again.");
        } else {
          const token = tokenResponse.data.access_token;
          console.log("Access Token:", token);

          await storeToken(token); // Save the token
          res.send("Authorization successful! You can close this window.");
        }
      } catch (error) {
        console.error("Error Fetching Token:", error.message);
        res.send("Authorization failed. Please try again.");
      }
    });
  });
}

async function getStoredToken() {
  const config = vscode.workspace.getConfiguration("github-commiter");
  const token = config.get("token"); // This should fetch the token saved in settings
  if (!token) {
    vscode.window.showErrorMessage("GitHub authorization is required.");
    return null;
  }
  return token;
}

async function storeToken(token) {
  console.log("Storing Token:", token);
  const config = vscode.workspace.getConfiguration("github-commiter");
  try {
    await config.update("token", token, vscode.ConfigurationTarget.Global);
    console.log("Token stored successfully.");
    vscode.window.showInformationMessage("GitHub token saved successfully.");
  } catch (error) {
    console.error("Error Storing Token:", error.message);
    vscode.window.showErrorMessage(`Failed to save token: ${error.message}`);
  }
}

async function clearStoredToken() {
  const config = vscode.workspace.getConfiguration("github-commiter");
  try {
    await config.update("token", undefined, vscode.ConfigurationTarget.Global);
    accessToken = null; // Clear the in-memory token as well
    vscode.window.showInformationMessage("GitHub token cleared.");
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to clear token: ${error.message}`);
  }
}

function getAccessToken() {
  return accessToken;
}

module.exports = { authorizeWithGitHub, getAccessToken, clearStoredToken };
