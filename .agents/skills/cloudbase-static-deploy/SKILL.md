---
name: cloudbase-static-deploy
description: >
  Deploy this project's prebuilt static website to Tencent CloudBase Static
  Website Hosting. Use whenever the user asks to publish, redeploy, host,
  update, or verify the static pages in outputs/ on CloudBase, Tencent Cloud,
  or the project's CloudBase environment. The bundled PowerShell script stages
  the site, excludes local browser caches, uploads it, and verifies the public
  URL.
---

# CloudBase Static Deploy

Use this skill for the static website already generated in this repository. It
is a file upload workflow: there is no npm build step. Keeping the staging step
inside the script matters because `outputs/` can contain a local Chrome profile;
that data must never be published.

## One-command deployment

Run from the project root:

```powershell
.\.agents\skills\cloudbase-static-deploy\scripts\deploy.ps1
```

The script defaults to this project's CloudBase environment and `outputs/`.
For another environment or a different prebuilt directory:

```powershell
.\.agents\skills\cloudbase-static-deploy\scripts\deploy.ps1 `
  -EnvId <environment-id> `
  -SourceDir <static-output-directory>
```

If the local CloudBase CLI session is missing, the script starts the device
login flow. Ask the user to authorize the displayed Tencent Cloud page, then
rerun the same command if the first attempt exits before authorization.

## Workflow contract

1. Confirm the source directory contains `index.html`.
2. Copy the site into a temporary staging directory, excluding any path named
   `.chrome-profile` and rejecting files larger than 50 MB.
3. Ensure the target environment is reachable; if credentials are absent,
   perform `tcb login --flow device`.
4. Upload the staged files to the hosting root with bounded concurrency and
   retries.
5. Read the hosting detail to report the CDN domain and verify both `/` and
   `/thailand-honeymoon-map.html` return HTTP 200.

Do not upload the repository root. Do not publish `.chrome-profile`, secrets,
or other generated browser state. Do not delete remote files as part of a
normal deploy; same-name uploads intentionally overwrite the current version.

## Dependencies

- Windows PowerShell 7+
- Node.js/npm
- `@cloudbase/cli` (the script invokes it through `npx`; no global install is
  required)
- A Tencent Cloud account authorized for the target CloudBase environment

## Success output

Report the environment ID, number and size of uploaded files, the public CDN
URL, and the HTTP verification result. If login, upload, or verification
fails, stop and report the failing phase and the exact user action needed.
