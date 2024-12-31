require("dotenv").config({ path: __dirname + "/.env" });
const vscode = require("vscode");
const axios = require("axios");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect_uri = "https://github-committer-vs-code.vercel.app/api/callback";  // Your Vercel callback URL

let accessToken = null;

async function authorizeWithGitHub(context) {
  const storedToken = await getStoredToken(context); // Retrieve stored token
  if (storedToken) {
    accessToken = storedToken; // Use the stored token if available
    vscode.window.showInformationMessage("Using stored GitHub token.");
    return;
  }

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo&redirect_uri=${redirect_uri}`;
  vscode.env.openExternal(vscode.Uri.parse(authUrl));

  vscode.window.showInformationMessage(
    "Please complete authorization in your browser. Once done, return to VS Code."
  );
}

async function handleTokenCallback(context, token) {
  try {
    if (!token) {
      // If the token is not passed from the URL (direct callback response)
      // Use an API request to fetch it from the server instead
      const response = await axios.get('https://github-committer-vs-code.vercel.app/api/callback');
      if (response.data && response.data.token) {
        token = response.data.token;  // Get the token from the server response
      } else {
        throw new Error("Failed to retrieve token from the server.");
      }
    }

    await storeToken(context, token);  // Store the token in the VS Code secrets storage
    accessToken = token;
    vscode.window.showInformationMessage("Authorization successful and token securely stored.");
  } catch (error) {
    console.error("Error handling token callback:", error.message);
    vscode.window.showErrorMessage("Failed to store the GitHub token.");
  }
}

async function getStoredToken(context) {
  try {
    const token = await context.secrets.get("githubToken");
    console.log("Retrieved Token: ", token); // Add this log to check if the token is retrieved
    if (!token) {
      throw new Error("No stored GitHub token found.");
    }
    return token;
  } catch (error) {
    console.error("Error retrieving token:", error.message);
    return null;
  }
}

async function storeToken(context, token) {
  try {
    await context.secrets.store("githubToken", token);
    vscode.window.showInformationMessage("GitHub token saved securely.");
  } catch (error) {
    console.error("Error storing token:", error.message);
  }
}

async function clearStoredToken(context) {
  try {
    await context.secrets.delete("githubToken");
    vscode.window.showInformationMessage("GitHub token cleared.");
  } catch (error) {
    console.error("Error clearing token:", error.message);
  }
}

function getAccessToken() {
  return accessToken;
}

module.exports = {
  authorizeWithGitHub,
  handleTokenCallback,
  getAccessToken,
  getStoredToken,
  storeToken,
  clearStoredToken,
};

