const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const mockingDir = path.resolve(__dirname, "../mocking");
const pythonPath = os.platform() === "win32"
  ? path.join(mockingDir, "venv", "Scripts", "python.exe")
  : path.join(mockingDir, "venv", "bin", "python");

const child = spawn(pythonPath, ["main.py"], {
  cwd: mockingDir,
  stdio: "inherit",
  shell: true,
});

child.on("close", (code) => {
  console.log(`Mock server exited with code ${code}`);
});