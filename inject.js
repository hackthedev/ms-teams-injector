const { exec, execSync } = require('child_process');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

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
async function injectScriptsFromFolder() {
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

      // Retry injection if not successful initially
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
            // Replace "injected-foldername" with the correct marker ID pattern
            return !!document.querySelector('[id^="injected-"]');
          });

          if (injected) {
            console.log('Marker element found: Injection successful.');
            injectionSuccessful = true;
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
    } else {
      console.log('Teams page not found.');
    }

    await browser.disconnect();
  } catch (error) {
    console.error('Error connecting to the Teams application:', error);
  }
}

// Main function to run the tasks
async function main() {
  killTeamsProcess();
  launchTeams();

  // Give some time for Teams to launch and be ready for connection
  setTimeout(async () => {
    await injectScriptsFromFolder();
  }, 10000); // 15-second delay to ensure Teams is fully loaded
}

main();
