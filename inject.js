const { exec, execSync } = require('child_process');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const axios = require('axios');
const ffi = require('ffi-napi');
const ref = require('ref-napi');

// Load kernel32.dll, user32.dll, and psapi.dll
const kernel32 = ffi.Library('kernel32', {
  'OpenProcess': ['long', ['uint', 'bool', 'uint']],
  'CloseHandle': ['bool', ['long']]
});

const user32 = ffi.Library('user32', {
  'EnumWindows': ['bool', ['pointer', 'long']],
  'GetWindowThreadProcessId': ['uint', ['long', 'pointer']],
  'GetWindowRect': ['bool', ['long', 'pointer']],
  'SetWindowPos': ['bool', ['long', 'long', 'int', 'int', 'int', 'int', 'uint']],
  'GetWindowTextA': ['int', ['long', 'char *', 'int']]
});

const psapi = ffi.Library('psapi', {
  'GetModuleBaseNameA': ['uint', ['long', 'long', 'char *', 'uint']]
});

const PROCESS_QUERY_INFORMATION = 0x0400;
const SWP_NOZORDER = 0x0004;
const SWP_NOMOVE = 0x0002;

// Function to get window handle by partial title match
function getWindowHandleByTitlePart(partOfTitle) {
  const windowHandles = [];

  const callback = ffi.Callback('bool', ['long', 'long'], (hwnd, lParam) => {
    const buffer = Buffer.alloc(256);
    user32.GetWindowTextA(hwnd, buffer, 256);
    const title = buffer.toString('utf8').replace(/\0/g, '');

    if (title.toLowerCase().includes(partOfTitle.toLowerCase())) {
      windowHandles.push(hwnd);
    }
    return true;
  });

  user32.EnumWindows(callback, 0);

  if (windowHandles.length > 0) {
    return windowHandles[0];
  }

  return null;
}

function resizeWindow(processName) {
  const hwnd = getWindowHandleByTitlePart(processName);

  if (hwnd) {
    const rect = Buffer.alloc(16);
    const success = user32.GetWindowRect(hwnd, rect);

    if (success) {
      const left = rect.readInt32LE(0);
      const top = rect.readInt32LE(4);
      const right = rect.readInt32LE(8);
      const bottom = rect.readInt32LE(12);

      console.log(`Window Rect: left=${left}, top=${top}, right=${right}, bottom=${bottom}`);

      const currentWidth = right - left;
      const currentHeight = bottom - top;
      const newWidth = currentWidth + 1;

      const setResult = user32.SetWindowPos(hwnd, 0, left, top, newWidth, currentHeight, SWP_NOZORDER | SWP_NOMOVE);

      if (setResult) {
        console.log('Successfully resized the window by increasing the width by 1 pixel.');
      } else {
        console.error('Failed to resize the window.');
      }

      // Close the handle after resizing
      kernel32.CloseHandle(hwnd);
    } else {
      console.error('Failed to get the window rectangle.');
    }
  } else {
    console.error('Could not find a window for the specified process name.');
  }
}

// Function to kill any existing Teams process
function killTeamsProcess() {
  try {
    console.log('Checking for running Teams processes...');
    execSync('taskkill /F /IM ms-teams.exe');
    console.log('Killed existing Teams process.');
  } catch (error) {
    console.log('No running Teams process found, or unable to terminate.');
  }
}

// Function to launch Teams with remote debugging enabled
function launchTeams() {
  const teamsPath = `"C:\\Program Files\\WindowsApps\\MSTeams_24243.1309.3132.617_x64__8wekyb3d8bbwe\\ms-teams.exe" --remote-debugging-port=9222`;

  console.log('Launching Microsoft Teams with remote debugging...');
  
  exec(teamsPath, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error launching Teams: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
  });
}

// Function to get all pages using the JSON endpoint
async function getAllPages() {
  try {
    const response = await axios.get('http://localhost:9222/json');
    return response.data.filter(page => page.type !== 'service_worker'); // Exclude service workers
  } catch (error) {
    console.error('Failed to get pages from /json endpoint:', error);
    return [];
  }
}

// Function to inject a script into a given page
async function injectScriptToPage(pageUrl) {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222'
    });

    const pages = await browser.pages();
    const targetPage = pages.find(page => page.url() === pageUrl);

    if (targetPage) {
      console.log(`Injecting script into page: ${pageUrl}`);

      // Specify the directory containing JavaScript plugin folders
      const scriptsDir = path.resolve(__dirname, 'scripts');

      const subfolders = fs.readdirSync(scriptsDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

      for (const folder of subfolders) {
        const mainJsPath = path.join(scriptsDir, folder, 'main.js');

        if (fs.existsSync(mainJsPath)) {
          const scriptContent = fs.readFileSync(mainJsPath, 'utf-8');

          try {
            await targetPage.evaluate(scriptContent);
            console.log(`Injected script from: ${folder}/main.js`);
          } catch (injectError) {
            console.error(`Failed to inject script from ${folder}/main.js: ${injectError.message}`);
          }
        } else {
          console.log(`No main.js found in: ${folder}, skipping...`);
        }
      }

      await browser.disconnect();
    }
  } catch (error) {
    console.error(`Failed to inject script into page ${pageUrl}:`, error);
  }
}

// Function to inject scripts into all pages
async function injectScriptsIntoAllPages() {
  const pages = await getAllPages();

  for (const page of pages) {
    await injectScriptToPage(page.url);
  }
  
  resizeWindow("Microsoft Teams");
  
  const browser = await puppeteer.connect({ browserURL: 'http://localhost:9222' });
  await browser.disconnect();
}

// Main function to run the tasks
async function main() {
  killTeamsProcess();
  launchTeams();

  setTimeout(async () => {
    await injectScriptsIntoAllPages();
  }, 10000); // Delay to ensure pages are fully loaded
}

main();

// Create a readline interface to catch process input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Listen for user input
rl.on('line', (input) => {
  if (input.trim() === 'reinject') {
    console.log('Reinjecting scripts...');
    injectScriptsIntoAllPages();
  } else {
    console.log(`Unknown command: ${input}`);
  }
});
