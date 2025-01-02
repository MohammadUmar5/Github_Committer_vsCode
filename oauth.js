const vscode = require("vscode");

async function authorizeWithGitHub(context) {
  const session = await vscode.authentication.getSession(
    "github",
    ["user:email"],
    { createIfNone: true }
  );

  if (session) {
    console.log("GitHub authorization successful.");

    // Storing the token in secret storage
    if (context.secrets) {
      await context.secrets.store("github-token", session.accessToken);
      return session.accessToken; // Return the token for further use in the extension
    } else {
      throw new Error("Secret storage is not available.");
    }
  } else {
    throw new Error("GitHub authorization failed");
  }
}

async function storeToken(context, token) {
  try {
    if (context.secrets) {
      await context.secrets.store("github-token", token);
      console.log("Token successfully stored.");
    } else {
      throw new Error("Secret storage is not available.");
    }
  } catch (error) {
    console.error("Failed to store token:", error);
  }
}

async function getStoredToken(context) {
  try {
    if (context.secrets) {
      const token = await context.secrets.get("github-token");
      if (token) {
        console.log("Token successfully retrieved.");
      } else {
        console.log("No token found.");
      }
      return token; // Return the token to be used in the extension
    } else {
      throw new Error("Secret storage is not available.");
    }
  } catch (error) {
    console.error("Failed to retrieve token:", error);
    return null;
  }
}

async function clearStoredToken(context) {
  try {
    if (context.secrets) {
      await context.secrets.delete("github-token");
      console.log("Token cleared successfully.");
    } else {
      throw new Error("Secret storage is not available.");
    }
  } catch (error) {
    console.error("Failed to clear token:", error);
  }
}

module.exports = {
  storeToken,
  getStoredToken,
  clearStoredToken,
  authorizeWithGitHub,
};