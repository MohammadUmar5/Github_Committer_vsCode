const vscode = require('vscode');
const axios = require('axios');
const simpleGit = require('simple-git');

const CLIENT_ID = 'Ov23liHnfz8HDgIoBsZk'; // Replace with your GitHub App's Client ID
const CLIENT_SECRET = '9adc183f1f90249ce2046d37e7d0f8fed76dc509'; // Replace with your GitHub App's Client Secret
const REDIRECT_URI = 'http://localhost:3000/callback'; // Replace with your GitHub App's Redirect URI

let accessToken = null;

async function authorizeWithGitHub() {
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

                // Set the current Git repository directory
                const repoPath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
                if (!repoPath) {
                    res.send('Failed: No workspace folder detected. Please open a Git repository in VS Code.');
                    server.close();
                    reject(new Error('No workspace folder detected.'));
                    return;
                }

                const git = simpleGit(repoPath); // Initialize Git in the workspace folder
                await git.addConfig('http.extraheader', `Authorization: Bearer ${accessToken}`);

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

function getAccessToken() {
    return accessToken;
}

module.exports = { authorizeWithGitHub, getAccessToken };
