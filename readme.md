## How to install

You likely need to edit the configuration.json file of teams to enabled debug mode.
In my case i found it here: `C:\Program Files\WindowsApps\MSTeams_24243.1309.3132.617_x64__8wekyb3d8bbwe\`.
You can right click Microsoft Teams in Task Manager and open the file path this way.

In order to change the config file you would need to use the following commands. You might need to change the path.
```bat
takeown /F "C:\Program Files\WindowsApps\MSTeams_24243.1309.3132.617_x64__8wekyb3d8bbwe\configuration.json"
icacls "C:\Program Files\WindowsApps\MSTeams_24243.1309.3132.617_x64__8wekyb3d8bbwe\configuration.json" /grant %username%:F
```

The config file should look similar to the following. Its mostly important to use `"core/devMenuEnabled": true`.<b> You may not even need to edit the config at all</b>.
```json
{
  "app/modifyComGlobalRoSettings": true,
  "app/enableAppSwitcher": true,
  "app/enableAppSwitcherMac": true,
  "core/hideMainWindow": true,
  "core/startPage": "https://teams.microsoft.com/v2/?skipauthstrap=1",
  "ecs/packageConfigEnabled": true,
  "systemTray/enableSignout": false,
  "taskbar/enableFlyoutBadge": false,
  "core/devMenuEnabled": true
}
```

I will further debug this and i will integrade it into the script.

## How to use
Since its still kinda experimental you can run teams with `node inject.js`. It will relaunch teams if needed with the custom code.
