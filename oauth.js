const vscode = require("vscode");
const axios = require("axios");
require("dotenv").config(); // Load environment variables from .env file

const CLIENT_ID=process.env.CLIENT_ID; // Loaded from .env
const CLIENT_SECRET=process.env.CLIENT_SECRET; // Loaded from .env
const redirect_uri = "http://localhost:3000/callback"; // Default fallback

let accessToken = null;

async function authorizeWithGitHub(context) { // Accept context parameter
 const storedToken = await getStoredToken(context); // Pass context here
 if (storedToken) {
   accessToken = storedToken;
   vscode.window.showInformationMessage("Using stored GitHub token.");
   return;
 }

 const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo`;
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
           client_id: CLIENT_ID,
           client_secret: CLIENT_SECRET,
           code,
           redirect_uri: redirect_uri, // Optional, only needed if set in GitHub app
         },
         { headers: { Accept: "application/json" } }
       );

       console.log("Token Response:", tokenResponse.data);

       if (tokenResponse.data.error) {
         console.error("GitHub Error:", tokenResponse.data.error_description);
         res.send("Authorization failed. Please try again.");
       } else {
         const token = tokenResponse.data.access_token;
         console.log("Access Token:", token);

         await storeToken(context, token); // Save the token securely with context
         accessToken = token; // Store it in memory as well for immediate use
         res.send("Authorization successful! You can close this window.");
       }
     } catch (error) {
       console.error("Error Fetching Token:", error.message);
       res.send("Authorization failed. Please try again.");
     }
   });
 });
}

// Function to retrieve stored token from secretStorage
async function getStoredToken(context) { 
 try { 
   const token = await context.secrets.get("githubToken"); 
   
   if (!token) { 
     throw new Error('No stored GitHub token found.'); 
   } 

   return token; 
 } catch (error) { 
   console.error("Error retrieving token:", error.message); 
   return null; 
 } 
}

// Function to store token securely in secretStorage
async function storeToken(context, token) { 
 try { 
   await context.secrets.store("githubToken", token); 
   vscode.window.showInformationMessage("GitHub token saved securely."); 
 } catch (error) { 
   console.error("Error storing token:", error.message); 
 } 
}

// Function to clear stored token from secretStorage
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

module.exports = { authorizeWithGitHub, getAccessToken, getStoredToken, storeToken, clearStoredToken };
