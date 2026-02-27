---
description: How to manage and verify automated deployments for the S.A.A.M. dashboard.
---

# Automated Deployment Workflow

The S.A.A.M. dashboard uses GitHub Actions and Google Cloud Workload Identity Federation (WIF) for zero-key automated deployments to Firebase.

## Triggering a Deployment
Deployments are automatically triggered on every push to the `main` branch.

1.  **Commit Changes**: Commit your code changes to a feature branch or directly to `main`.
2.  **Push to GitHub**: `git push origin main`
3.  **Monitor Progress**: View the "Actions" tab on GitHub: [blanxlait/situational-dashboard Actions](https://github.com/BLANXLAIT/situational-dashboard/actions)

## Workflow Details
- **Workflow File**: `.github/workflows/deploy.yml`
- **Authentication**: OIDC/WIF via the `github-ci` service account.
- **Components Deployed**:
    - **Frontend**: Built via `npm run build`, deployed to Firebase Hosting.
    - **Functions**: Built via `npm run build` in `functions/`, deployed to Firebase Functions.

## Troubleshooting
If a deployment fails:
1.  **Check Permissions**: Ensure the `github-ci` service account has the following roles:
    - `roles/iam.serviceAccountUser` (on the `appspot` service account)
    - `roles/firebase.admin`
    - `roles/cloudfunctions.developer`
    - `roles/serviceusage.serviceUsageConsumer`
    - `roles/cloudbuild.builds.editor`
2.  **Logs**: Use `gh run view <run_id> --log-failed` to identify specific errors.
3.  **Firebase CLI**: If necessary, run a manual deploy once to resolve interactive prompts: `npx firebase-tools deploy`.

## Verification
Post-deployment, verify the live app at:
https://saam-dashboard-1772190712.web.app
