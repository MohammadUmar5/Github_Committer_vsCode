# Changelog

All notable changes to the "GitHub Committer" extension will be documented in this file.

This project adheres to [Keep a Changelog](http://keepachangelog.com/).

## [Unreleased]

- Extend functionality to support auto-commit for every branch alongside the main branch.

### Added

- Initial implementation of auto-commit functionality using simple-git.
- OAuth authorization with GitHub for secure access to repositories.
- File watcher to track added, modified, and deleted files in the workspace.
- Commands to start and stop the auto-commit feature.
- Secure token storage using VS Code Secret Storage.

### Fixed

- Addressed potential security concerns by securing token storage and OAuth configuration.
- Resolved activation event issues for efficient extension startup.

### Changed

- Updated package metadata to align with VS Code marketplace requirements.

---

## [0.0.5] - 2024-12-27

### Added

- Improved error handling for GitHub OAuth authorization.
- Enhanced validation for Git remotes to ensure the presence of an "origin" remote.

### Changed

- Refined configuration and activation events to better align with user needs.
- Switched to vercel-based callback URL for improved OAuth compatibility.

---

## [0.0.4] - 2024-12-26

### Added

- Basic functionality for OAuth-based GitHub authentication.
- Auto-commit feature to push changes to the repository at regular intervals.
- Commands to control the auto-commit process (`startAutoCommit` and `stopAutoCommit`).

---

## [0.0.1] - 2024-12-25

### Added

- Initial release of the GitHub Committer extension.
- Basic structure and functionality with placeholder commands.
