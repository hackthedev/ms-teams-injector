const { exec, execSync } = require('child_process');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

  // Callback for EnumWindows
  const callback = ffi.Callback('bool', ['long', 'long'], (hwnd, lParam) => {
    const buffer = Buffer.alloc(256); // Allocate buffer for the window title
    user32.GetWindowTextA(hwnd, buffer, 256);
    const title = buffer.toString('utf8').replace(/\0/g, ''); // Get window title

    if (title.toLowerCase().includes(partOfTitle.toLowerCase())) {
      windowHandles.push(hwnd);
    }
    return true; // Continue enumeration
  });

  user32.EnumWindows(callback, 0);

  if (windowHandles.length > 0) {
    return windowHandles[0]; // Return the first matching window handle
  }

  return null;
}

function resizeWindow(processName){
	
	// Main logic
	const hwnd = getWindowHandleByTitlePart(processName);

	if (hwnd) {
	  console.log('Found window handle:', hwnd);

	  // Get the current window rectangle
	  const rect = Buffer.alloc(16); // RECT struct: left, top, right, bottom (4 integers)
	  const success = user32.GetWindowRect(hwnd, rect);

	  if (success) {
		const left = rect.readInt32LE(0);
		const top = rect.readInt32LE(4);
		const right = rect.readInt32LE(8);
		const bottom = rect.readInt32LE(12);

		console.log(`Window Rect: left=${left}, top=${top}, right=${right}, bottom=${bottom}`);

		// Resize the window by increasing the width by 1 pixel
		const currentWidth = right - left;
		const currentHeight = bottom - top;
		const newWidth = currentWidth + 1;

		const setResult = user32.SetWindowPos(hwnd, 0, left, top, newWidth, currentHeight, SWP_NOZORDER | SWP_NOMOVE);

		if (setResult) {
		  console.log('Successfully resized the window by increasing the width by 1 pixel.');
		} else {
		  console.error('Failed to resize the window.');
		}
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

// Function to connect to Teams and inject JavaScript from the 'scripts' folder
async function injectScripts() {
  try {
    console.log('Connecting to Microsoft Teams...');
    const browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222' // Connect to the debugging port
    });

    const pages = await browser.pages();
    const teamsPage = pages.find(page => page.url().includes('teams.microsoft.com'));

    if (teamsPage) {
      console.log('Waiting for Teams page to stabilize...');
      await teamsPage.waitForSelector('body', { timeout: 3000 });

      let injectionSuccessful = false;
      let attempts = 0;

      while (!injectionSuccessful && attempts < 5) {
        attempts++;
        console.log('Injecting JavaScript from the "scripts" folder... (Attempt ' + attempts + ')');

        // Specify the directory containing JavaScript plugin folders
        const scriptsDir = path.resolve(__dirname, 'scripts'); // Directory with plugin subfolders

        // Read all subfolders from the directory
        const subfolders = fs.readdirSync(scriptsDir, { withFileTypes: true })
          .filter(entry => entry.isDirectory())
          .map(entry => entry.name);

        for (const folder of subfolders) {
          const mainJsPath = path.join(scriptsDir, folder, 'main.js');
          
          if (fs.existsSync(mainJsPath)) {
            const scriptContent = fs.readFileSync(mainJsPath, 'utf-8');

            try {
              await teamsPage.evaluate(scriptContent);
              console.log(`Injected script from: ${folder}/main.js`);
            } catch (injectError) {
              console.error(`Failed to inject script from ${folder}/main.js: ${injectError.message}`);
            }
          } else {
            console.log(`No main.js found in: ${folder}, skipping...`);
          }
        }

        // Inject static code to verify injection
        try {
          // Wait and verify if the marker element is present
          const injected = await teamsPage.evaluate(() => {
            return !!document.querySelector('[id^="injected-"]');
          });
          
          if (injected) {
            console.log('Marker element found: Injection successful.');
            injectionSuccessful = true;
			
			try{
				resizeWindow("Microsoft Teams")
			}
			catch(resizeError){
				console.warn("Resizing Window Failed")
				console.warn(resizeError.message);
			}
          } else {
            console.log('Marker element not found, retrying...');
          }
        } catch (injectError) {
          console.error(`Verification failed: ${injectError.message}`);
        }

        if (!injectionSuccessful) {
          console.log('Retrying injection after delay...');
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
        }
      }

      if (!injectionSuccessful) {
        console.error('Injection failed after multiple attempts.');
      }

      await browser.disconnect();
    } else {
      console.log('Teams page not found.');
    }
  } catch (error) {
    console.error('Error connecting to the Teams application:', error);
  }
}

// Function to re-inject scripts
async function reinjectScripts() {
  console.log('Reinjecting scripts...');
  await injectScripts();
}

// Main function to run the tasks
async function main() {
  killTeamsProcess();
  launchTeams();

  // Give some time for Teams to launch and be ready for connection
  setTimeout(async () => {
    await injectScripts();
  }, 10000); // 10-second delay to ensure Teams is fully loaded
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
    reinjectScripts();
  } else {
    console.log(`Unknown command: ${input}`);
  }
});
