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
  const teamsPath = `"C:\\Program Files\\WindowsApps\\MSTeams_24243.1309.3132.617_x64__8wekyb3d8bbwe\\ms-teams.exe" msteams:work --remote-debugging-port=9222`;

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
      await teamsPage.waitForSelector('body', { timeout: 30000 });

      console.log('Injecting JavaScript from the "scripts" folder...');

      // Specify the directory containing JavaScript files
      const scriptsDir = path.resolve(__dirname, 'scripts'); // Directory with JavaScript files

      // Read all JavaScript files from the directory
      const files = fs.readdirSync(scriptsDir);
      const jsFiles = files.filter(file => file.endsWith('.js'));

      for (const file of jsFiles) {
        const filePath = path.join(scriptsDir, file);
        const scriptContent = fs.readFileSync(filePath, 'utf-8');

        try {
          await teamsPage.evaluate(scriptContent);
          console.log(`Injected script from: ${file}`);
        } catch (injectError) {
          console.error(`Failed to inject script from ${file}: ${injectError.message}`);
        }
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
  }, 15000); // 15-second delay to ensure Teams is fully loaded
}

main();
