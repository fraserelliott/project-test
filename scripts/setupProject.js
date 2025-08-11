const { spawnSync } = require("child_process");
const fs = require('fs');
const path = require("path");
const os = require("os");

function runCmd(command, args, options = {}) {
  console.log(`Running: ${command} ${args.join(" ")}`);

  let result;

  if (process.platform === "win32") {
    result = spawnSync(command, args, { stdio: "inherit", shell: true, ...options });
  } else {
    result = spawnSync(command, args, { stdio: "inherit", ...options });
  }

  if (result.error) {
    console.error(`Failed to run ${command}:`, result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`${command} exited with code ${result.status}`);
    process.exit(result.status);
  }
}

async function installProject() {
  const rootDir = path.resolve(__dirname, "..");

  // Backend
  const backendDir = path.join(rootDir, "backend");
  process.chdir(backendDir);
  runCmd("npm", ["install"]);

  // Mocking server
  const mockingDir = path.join(rootDir, "mocking");
  process.chdir(mockingDir);

  // Create virtualenv
  if (os.platform() === "win32") {
    runCmd("python", ["-m", "venv", "venv"]);
    runCmd("venv\\Scripts\\python", ["-m", "pip", "install", "-r", "requirements.txt"]);
  } else {
    let pythonCmd = "python3";
    if (spawnSync("which", ["python3"]).status !== 0) {
      pythonCmd = "python";
    }
    runCmd(pythonCmd, ["-m", "venv", "venv"]);
    runCmd("bash", ["-c", `source venv/bin/activate && ${pythonCmd} -m pip install -r requirements.txt`]);
  }

  // Frontend
  const frontendDir = path.join(rootDir, "frontend");
  process.chdir(frontendDir);
  runCmd("npm", ["install"]);

  console.log("Setup complete!");
}

function copyEnvExample(targetDir) {
  const src = path.join(targetDir, '.env.example');
  const dest = path.join(targetDir, '.env');

  if (!fs.existsSync(src)) {
    console.warn(`No .env.example found in ${targetDir}, skipping copy.`);
    return;
  }

  // Only copy if .env doesn't already exist, to avoid overwriting user changes
  if (fs.existsSync(dest)) {
    console.log(`.env already exists in ${targetDir}, skipping copy.`);
    return;
  }

  fs.copyFileSync(src, dest);
  console.log(`Copied .env.example to .env in ${targetDir}`);
}

installProject();
copyEnvExample(path.resolve(__dirname, '../backend'));