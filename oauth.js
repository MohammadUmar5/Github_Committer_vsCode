const vscode = require('vscode');
const axios = require('axios');


const CLIENT_ID = "Ov23liCDsOW9cIIeW52k" // Loaded from .env
const CLIENT_SECRET = "c47cb8de05587664ddf3f1b0a2bb128b2c67f86c"; // Loaded from .env
const REDIRECT_URI = "http://localhost:3000/callback"; // Default fallback

let accessToken = null;

async function authorizeWithGitHub() {
    const storedToken = await getStoredToken();
    if (storedToken) {
        accessToken = storedToken;
        vscode.window.showInformationMessage('Using stored GitHub token.');
        return;
    }

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo`;
    vscode.env.openExternal(vscode.Uri.parse(authUrl));

    vscode.window.showInformationMessage('Please complete authorization in your browser.');

    const express = require('express');
    const app = express();

    return new Promise((resolve, reject) => {
        const server = app.listen(3000, () => {
            console.log('OAuth server listening on port 3000');
        });
        app.get('/callback', async (req, res) => {
            const code = req.query.code;
            console.log('Authorization Code Received:', code);
        
            try {
                const tokenResponse = await axios.post(
                    'https://github.com/login/oauth/access_token',
                    {
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                        code,
                        redirect_uri: REDIRECT_URI, // Optional, only needed if set in GitHub app
                    },
                    {
                        headers: { Accept: 'application/json' },
                    }
                );
                
                console.log('Token Response:', tokenResponse.data);
        
                if (tokenResponse.data.error) {
                    console.error('GitHub Error:', tokenResponse.data.error_description);
                    res.send('Authorization failed. Please try again.');
                } else {
                    const token = tokenResponse.data.access_token;
                    console.log('Access Token:', token);
        
                    await storeToken(token); // Save the token
                    res.send('Authorization successful! You can close this window.');
                }
            } catch (error) {
                console.error('Error Fetching Token:', error.message);
                res.send('Authorization failed. Please try again.');
            }
        });
        
    });
}

async function getStoredToken() {
    const config = vscode.workspace.getConfiguration('github-commiter');
    const token = config.get('token');  // This should fetch the token saved in settings
    if (!token) {
        vscode.window.showErrorMessage('GitHub authorization is required.');
        return null;
    }
    return token;
}


async function storeToken(token) {
    console.log('Storing Token:', token);
    const config = vscode.workspace.getConfiguration('github-commiter');
    try {
        await config.update('token', token, vscode.ConfigurationTarget.Global);
        console.log('Token stored successfully.');
        vscode.window.showInformationMessage('GitHub token saved successfully.');
    } catch (error) {
        console.error('Error Storing Token:', error.message);
        vscode.window.showErrorMessage(`Failed to save token: ${error.message}`);
    }
}


async function clearStoredToken() {
    const config = vscode.workspace.getConfiguration('github-commiter');
    try {
        await config.update('token', undefined, vscode.ConfigurationTarget.Global);
        accessToken = null; // Clear the in-memory token as well
        vscode.window.showInformationMessage('GitHub token cleared.');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to clear token: ${error.message}`);
    }
}

function getAccessToken() {
    return accessToken;
}

module.exports = { authorizeWithGitHub, getAccessToken, clearStoredToken };
