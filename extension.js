const vscode = require("vscode");
const simpleGit = require("simple-git");
const { authorizeWithGitHub, getAccessToken } = require("./oauth");

// Initialize simple-git
const git = simpleGit();

// Change tracker
let changeTracker = {
    added: new Set(),
    modified: new Set(),
    deleted: new Set(),
};

let commitTimer = null;

function activate(context) {
    vscode.window.showInformationMessage("GitHub Committer extension is now active!");

    context.subscriptions.push(
        vscode.commands.registerCommand("github-commiter.startAutoCommit", startAutoCommit),
        vscode.commands.registerCommand("github-commiter.stopAutoCommit", stopAutoCommit),
        vscode.commands.registerCommand("github-commiter.authorizeWithGitHub", async () => {
            await authorizeWithGitHub();
            vscode.window.showInformationMessage("GitHub Authorization completed.");
        })
    );

    // Watch file system for changes
    const fileWatcher = vscode.workspace.createFileSystemWatcher("**/*", false, false, false);
    fileWatcher.onDidCreate((uri) => changeTracker.added.add(uri.fsPath));
    fileWatcher.onDidChange((uri) => changeTracker.modified.add(uri.fsPath));
    fileWatcher.onDidDelete((uri) => changeTracker.deleted.add(uri.fsPath));
    context.subscriptions.push(fileWatcher);
}

async function startAutoCommit() {
    if (commitTimer) {
        vscode.window.showWarningMessage("Auto commit is already running.");
        return;
    }

    commitTimer = setInterval(performCommit, 30 * 1000); // Commit every 30 seconds
    vscode.window.showInformationMessage("Auto commit started!");
}

function stopAutoCommit() {
    if (!commitTimer) {
        vscode.window.showWarningMessage("Auto commit is not running.");
        return;
    }

    clearInterval(commitTimer);
    commitTimer = null;
    vscode.window.showInformationMessage("Auto commit stopped!");
}

async function performCommit() {
    const repoPath = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
    if (!repoPath) {
        vscode.window.showErrorMessage(
            "No workspace folder detected. Please open a Git repository."
        );
        return;
    }

    try {
        // Set the current working directory for Git
        await git.cwd(repoPath);

        // Ensure OAuth authorization
        const token = getAccessToken();
        if (!token) {
            vscode.window.showErrorMessage("Please authorize with GitHub first.");
            return;
        }

        // Check if remote 'origin' exists
        const remotes = await git.getRemotes(true);
        const originRemote = remotes.find((remote) => remote.name === "origin");

        // If no remote named 'origin' exists, add it (optional)
        if (!originRemote) {
            vscode.window.showErrorMessage(
                "No remote named 'origin' found. Please add a remote repository and try again."
            );
            return;
        }

        // Generate commit summary
        const summary = generateSummary();
        if (!summary) {
            vscode.window.showInformationMessage("No changes to commit.");
            return;
        }

        // Stage changes and commit
        await git.add("*");
        const commitMessage = `Auto-Commit: ${new Date().toLocaleString()}\n\n${summary}`;
        await git.commit(commitMessage);

        // Push to the remote repository
        await git.push("origin", "main"); // Replace 'main' with your branch name if different

        resetTracker();
        vscode.window.showInformationMessage("Changes committed and pushed successfully!");
    } catch (error) {
        vscode.window.showErrorMessage(
            `Error during auto-commit: ${error.message}`
        );
    }
}

function generateSummary() {
    const summaryLines = [];

    // Track modified files separately from added files
    if (changeTracker.modified.size) {
        summaryLines.push(`Modified: ${Array.from(changeTracker.modified).join(", ")}`);
    }

    // Track added files
    if (changeTracker.added.size) {
        summaryLines.push(`Added: ${Array.from(changeTracker.added).join(", ")}`);
    }

    // Track deleted files
    if (changeTracker.deleted.size) {
        summaryLines.push(`Deleted: ${Array.from(changeTracker.deleted).join(", ")}`);
    }

    return summaryLines.length ? summaryLines.join("\n") : null;
}

function resetTracker() {
    changeTracker = {
        added: new Set(),
        modified: new Set(),
        deleted: new Set(),
    };
}

function deactivate() {
    if (commitTimer) {
        clearInterval(commitTimer);
    }
}

module.exports = {
    activate,
    deactivate,
};
