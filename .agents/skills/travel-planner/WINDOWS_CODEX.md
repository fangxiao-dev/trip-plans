# Windows + Codex compatibility

This adaptation stores travel preferences and trip records in `<project>/.codex-travel/travel-planner/`. It deliberately does not read or write a user-home data directory.

From the skill directory, use the PowerShell wrappers:

```powershell
.\scripts\travel-db.ps1 is_initialized
.\scripts\travel-db.ps1 get_preferences
.\scripts\travel-db.ps1 get_trips current
.\scripts\generate-plan.ps1 --trip-id <id> --output .\plan.json
```

The wrappers locate `python` first and then the Windows Python launcher (`py -3`). To use another project-local folder, set `TRAVEL_PLANNER_DATA_DIR` to an absolute path inside the project before invoking a wrapper.

Data files are UTF-8 JSON, so Chinese destinations, food preferences, and notes are preserved correctly on Windows.
