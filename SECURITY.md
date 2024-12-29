# Security Policy

## Supported Versions

We ensure security updates for the following versions of the GitHub Committer extension:

| Version | Supported          |
|---------|--------------------|
| 0.0.4   | :white_check_mark: |
| < 0.0.4 | :x:                |

If you are using an older version, please update to the latest release to receive security updates.

---

## Reporting a Vulnerability

If you discover a vulnerability in the GitHub Committer extension, please report it to us as soon as possible to ensure it can be addressed promptly and responsibly. 

### How to Report

- **Contact:** umar.warsi887@gmail.com
- **Confidentiality:** We will handle your report confidentially and keep you informed of the progress as we work on a fix.
- **Response Time:** We aim to respond to vulnerability reports as soon as possible.

---

## Security Measures

The GitHub Committer extension incorporates the following measures to ensure security:

1. **Secure Token Storage**  
   All sensitive tokens, including GitHub access tokens, are securely stored using Visual Studio Code's `secretStorage` API. Tokens are never written to disk in plaintext or hardcoded in the source code.

2. **Environment Variable Usage**  
   Sensitive data, such as the GitHub OAuth `CLIENT_ID` and `CLIENT_SECRET`, are loaded securely from environment variables using the `dotenv` library. This ensures that no sensitive credentials are included in the source code or the published package.

3. **Minimized Permissions**  
   The extension requests only the necessary GitHub OAuth scopes (`repo`) to perform its operations. It does not request additional permissions unnecessarily.

4. **Encrypted Communication**  
   All communication with GitHub's APIs is encrypted using HTTPS. No data is sent or received over unencrypted channels.

5. **No Data Collection**  
   The extension does not collect, store, or transmit any user data outside of GitHub's required OAuth flow.

6. **Regular Security Audits**  
   The extension undergoes regular security reviews to identify and address potential vulnerabilities.

---

## Responsible Disclosure

If you encounter any security issues or have suggestions for improving the security of this extension, please reach out to us. Your feedback is valuable and helps us maintain a secure and trustworthy tool for the community.

Thank you for contributing to the security of GitHub Committer!

---

## Acknowledgments

Special thanks to the Visual Studio Code team and the open-source community for providing guidance and tools to implement secure practices.
