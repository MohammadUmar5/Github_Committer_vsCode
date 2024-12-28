# GitHub Committer Extension

GitHub Committer is a Visual Studio Code extension that automates the process of committing and pushing changes to your GitHub repository. It's perfect for developers looking to save time by automating repetitive Git operations while maintaining an organized commit history.

---

## Features

- **Automatic Commit and Push**: Automatically commits and pushes your changes to your GitHub repository at a fixed interval (every 30 minutes).
- **Smart Change Tracking**: Tracks added, modified, and deleted files separately to generate detailed commit messages.
- **OAuth Integration**: Securely authorizes with GitHub, so you don't need to enter credentials repeatedly.
- **Simple Start/Stop**: Easily start and stop auto-committing using VS Code commands.

---

## Requirements

- A GitHub account.
- Git installed on your system.
- A workspace folder open in VS Code with a valid Git repository initialized.
- Currently, the extension commits and pushes only to the main branch.

---

## Commands

The extension includes these user-friendly commands:

1. **`Authorize with GitHub`**  
   Authorize the extension to interact with your GitHub account. This step is required only once unless the token expires or is revoked.

2. **`Start Auto Commit`**  
   Start the automatic commit and push process.

3. **`Stop Auto Commit`**  
   Stop the automatic commit process.

---

## How It Works

1. Install the extension from the VS Code Marketplace.
2. Open a workspace folder with a Git repository.
3. Use the **`Authorize with GitHub`** command via `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) to authorize the extension with your GitHub account.  
4. Use the **`Start Auto Commit`** command to begin automated commits and pushes.
5. The extension will automatically detect changes and commit them to your repository with detailed summaries every 30 minutes.

> **Notes:**  
> - The GitHub token is securely stored, so you won't need to reauthorize unless the token becomes invalid.  
> - Use the `Start Auto Commit` command once per session. If you close VS Code or restart your device, simply run the command again to resume hassle-free automation.

---

## Known Issues

- **Manual Authorization**: Users must manually run the authorization command using `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) when using the extension for the first time.  
- **Workspace Dependency**: The extension only works when a workspace folder with a valid Git repository is open.

---

## Release Notes

### 1.0.0

- Initial release of GitHub Committer.
- Added support for automatic commits and pushes.
- Smart file change tracking and detailed commit summaries.

---

License
This extension is licensed under the Apache License, Version 2.0.
Copyright 2024 Mohd Umar Warsi

Licensed under the Apache License, Version 2.0 (the "License");  
you may not use this file except in compliance with the License.  
You may obtain a copy of the License at  

    http://www.apache.org/licenses/LICENSE-2.0  

Unless required by applicable law or agreed to in writing, software  
distributed under the License is distributed on an "AS IS" BASIS,  
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  
See the License for the specific language governing permissions and  
limitations under the License.

## For more information

- [Visual Studio Code's Extension Development Documentation](https://code.visualstudio.com/api)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps)

---

**Enjoy seamless GitHub integration with GitHub Committer! 🚀**
