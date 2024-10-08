# MS Teams Mod
With this you can create custom themes or plugins using javascript. One default theme is included.
Its still somewhat experimental but i will try to improve the setup over time.
![image](https://github.com/user-attachments/assets/d0dfad9d-4ca8-441f-96a0-8d85b6136add)

<br>

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

<br>

## How to use
### First Time Start
```
npm i
node inject.js
```

<br>

### Normally running it
`node inject.js`

This will change once i made a proper application for it

<br>

## How to set a custom picture?
Once the script launched etc you can type in the console window. You can enter `setImage Path\To\Image.png` and it will load and transform the image to be later injected. If you path has spaces in it like `C:\Users\cool name\Desktop\anime.png` you will likely need to add `"` at the end and beginning of the path, so it looks like this:
`setImage "C:\Users\cool name\Desktop\anime.png"`

<br>

## Update Goals
- [ ] Wrap GUI app around it with theme & plugin community "marketplace".
- [ ] Edit config file automatically
- [ ] Potentially inject into app.asar if its ever gonna get fixed
- [ ] Update the example theme to fix styling in other pages like the calendar etc
