require("dotenv").config({ path: __dirname + "/.env" });
const vscode = require("vscode");
const axios = require("axios");

const CLIENT_ID = process.env.CLIENT_ID; // Loaded from .env
const CLIENT_SECRET = process.env.CLIENT_SECRET; // Loaded from .env
const redirect_uri = "https://github-committer-vs-code.vercel.app/api/callback"; // Vercel callback URL

let accessToken = null;

async function authorizeWithGitHub(context) {
  const storedToken = await getStoredToken(context); // Pass context here
  if (storedToken) {
    accessToken = storedToken;
    vscode.window.showInformationMessage("Using stored GitHub token.");
    return;
  }

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo&redirect_uri=${redirect_uri}`;
  vscode.env.openExternal(vscode.Uri.parse(authUrl));

  vscode.window.showInformationMessage(
    "Please complete authorization in your browser."
  );
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
  getAccessToken,
  getStoredToken,
  storeToken,
  clearStoredToken,
};
