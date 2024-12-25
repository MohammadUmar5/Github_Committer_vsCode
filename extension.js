const vscode = require('vscode');
const simpleGit = require('simple-git');
const path = require('path');

// Initialize simple-git
const git = simpleGit();

// Track changes
let changeTracker = {
    added: new Set(),
    modified: new Set(),
    deleted: new Set(),
};

// Interval (in milliseconds)
const COMMIT_INTERVAL = 30 * 1000; // 30 seconds (for testing)

// Function to get the workspace folder
function getWorkspaceFolder() {
    return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : null;
}

// Extension activation
function activate(context) {
    vscode.window.showInformationMessage('Git Auto-Commit Extension is now active!');

    // Watch for file events
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document) => trackChanges(document, 'modified')),
        vscode.workspace.onDidCreateFiles((event) => {
            event.files.forEach((file) => trackChanges(file, 'added'));
        }),
        vscode.workspace.onDidDeleteFiles((event) => {
            event.files.forEach((file) => trackChanges(file, 'deleted'));
        })
    );

    // Periodic commit timer
    const workspaceFolder = getWorkspaceFolder();
    if (workspaceFolder) {
        const commitTimer = setInterval(() => performCommit(), COMMIT_INTERVAL);
        context.subscriptions.push({
            dispose: () => clearInterval(commitTimer),
        });

        vscode.window.showInformationMessage('Periodic auto-commit initialized!');
    } else {
        vscode.window.showErrorMessage('No workspace detected. Auto-commit cannot be initialized.');
    }
}

// Track changes in files
function trackChanges(file, changeType) {
    let filePath;

    if (file && file.uri && file.uri.fsPath) {
        // Extract the file path from the uri.fsPath property
        filePath = path.relative(getWorkspaceFolder() || '', file.uri.fsPath);
    } else if (file && typeof file === 'string') {
        filePath = file; // Handle plain string paths (if provided)
    } else {
        console.error(`Invalid file object:`, file);
        return;
    }

    if (!filePath || typeof filePath !== 'string') {
        console.error(`Invalid file path: ${filePath}`);
        return;
    }

    switch (changeType) {
        case 'added':
            changeTracker.added.add(filePath);
            break;
        case 'modified':
            changeTracker.modified.add(filePath);
            break;
        case 'deleted':
            changeTracker.deleted.add(filePath);
            break;
    }
}

// Perform git commit
async function performCommit() {
    const workspaceFolder = getWorkspaceFolder();
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder detected. Please open a Git repository.');
        return;
    }

    try {
        await git.cwd(workspaceFolder);

        // Generate commit summary
        const summary = generateSummary();
        if (!summary) {
            vscode.window.showInformationMessage('No changes to commit.');
            return;
        }

        // Stage changes and commit
        await git.add('*');
        const commitMessage = `Auto-Commit: ${new Date().toLocaleString()}\n\n${summary}`;
        await git.commit(commitMessage);

        // Push to remote
        await git.push();

        // Reset tracker
        resetTracker();

        vscode.window.showInformationMessage('Changes committed and pushed successfully!');
    } catch (error) {
        vscode.window.showErrorMessage(`Error during auto-commit: ${error.message}`);
        console.error('Commit error:', error);
    }
}

// Generate commit summary from tracked changes
function generateSummary() {
    const summaryLines = [];

    if (changeTracker.added.size) {
        summaryLines.push(`Added: ${Array.from(changeTracker.added).join(', ')}`);
    }
    if (changeTracker.modified.size) {
        summaryLines.push(`Modified: ${Array.from(changeTracker.modified).join(', ')}`);
    }
    if (changeTracker.deleted.size) {
        summaryLines.push(`Deleted: ${Array.from(changeTracker.deleted).join(', ')}`);
    }

    return summaryLines.length ? summaryLines.join('\n') : null;
}

// Reset the change tracker
function resetTracker() {
    changeTracker = {
        added: new Set(),
        modified: new Set(),
        deleted: new Set(),
    };
}

// Extension deactivation
function deactivate() {}

// Export activate and deactivate
module.exports = {
    activate,
    deactivate,
};
