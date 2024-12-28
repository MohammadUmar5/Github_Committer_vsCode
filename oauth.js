const vscode = require('vscode');
const axios = require('axios');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID; // Loaded from .env
const CLIENT_SECRET = process.env.CLIENT_SECRET; // Loaded from .env
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/callback'; // Default fallback

let accessToken = null;

async function authorizeWithGitHub() {
    const storedToken = getStoredToken();
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

            try {
                const tokenResponse = await axios.post(
                    'https://github.com/login/oauth/access_token',
                    {
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                        code,
                        redirect_uri: REDIRECT_URI,
                    },
                    {
                        headers: { Accept: 'application/json' },
                    }
                );

                accessToken = tokenResponse.data.access_token;
                storeToken(accessToken); // Save token for future sessions

                res.send('Authorization successful! You can close this window.');

                server.close();
                resolve(accessToken);
            } catch (error) {
                res.send('Authorization failed. Please try again.');
                server.close();
                reject(error);
            }
        });
    });
}

function getStoredToken() {
    const config = vscode.workspace.getConfiguration('github-commiter');
    return config.get('token');
}

function storeToken(token) {
    const config = vscode.workspace.getConfiguration('github-commiter');
    config.update('token', token, vscode.ConfigurationTarget.Global).then(
        () => vscode.window.showInformationMessage('GitHub token saved successfully.'),
        (error) => vscode.window.showErrorMessage(`Failed to save token: ${error.message}`)
    );
}

function clearStoredToken() {
    const config = vscode.workspace.getConfiguration('github-commiter');
    config.update('token', undefined, vscode.ConfigurationTarget.Global).then(
        () => vscode.window.showInformationMessage('GitHub token cleared.'),
        (error) => vscode.window.showErrorMessage(`Failed to clear token: ${error.message}`)
    );
}

function getAccessToken() {
    return accessToken;
}

module.exports = { authorizeWithGitHub, getAccessToken, clearStoredToken };
