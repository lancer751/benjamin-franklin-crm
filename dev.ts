import { spawn } from "child_process";
const child = spawn("npx", ["--no-install", "vite", "--host", "::", "--port", "8080"], {
  cwd: "./frontend",
  stdio: "inherit",
  shell: true,
});
child.on("exit", (code) => process.exit(code ?? 0));
