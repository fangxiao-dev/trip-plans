# Windows + Codex compatibility

This adaptation keeps all generated state in `<project>/.codex-travel/trip-map-builder/`:

- `MEMORY.md` for durable traveler preferences.
- `chrome-profile/` for a dedicated Chrome CDP profile.
- `tools/` for the project-local OpenCLI installation.
- `opencli-extension/` for the manually extracted Browser Bridge extension.

From the skill directory, prepare the local folders and install OpenCLI without changing global npm settings:

```powershell
.\scripts\setup-windows-codex.ps1 -InstallOpenCli
```

Download and extract the Browser Bridge extension into the printed `opencli-extension` folder. In Chrome, open `chrome://extensions`, enable Developer mode, and load that unpacked folder. Then start the dedicated CDP browser and verify the bridge:

```powershell
.\scripts\start-chrome-cdp.ps1
.\scripts\opencli.ps1 doctor
```

If the browser process exists but the CDP endpoint is unavailable, restart only this project's isolated browser profile:

```powershell
.\scripts\start-chrome-cdp.ps1 -Restart
```

Use the local wrapper for all research commands:

```powershell
.\scripts\opencli.ps1 dianping search "银座 午餐" --city 东京 --limit 5 -f json
.\scripts\opencli.ps1 xiaohongshu search "玉ひで 东京" --limit 10 -f json
```

`config/windows-codex.json` contains relative paths and the CDP port. Keep those values project-relative so browser state and tool files never spill into a user home directory.
