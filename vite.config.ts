import { Plugin, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

// Custom Vite plugin to generate build.html
const generateBuildInfo = (): Plugin => {
  // Only generate build.html if running in CI (e.g., CircleCI)
  if (process.env.CI) {
    // Execute the Git command, trim each line, and format the output with <br> tags
    const commitInfo = execSync(
      'git log -1 --format="Commit: %H%nDate: %ad%n%n %s %d"'
    )
      .toString()
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .join("<br>");

    return {
      name: "generate-build-info",
      apply: "build", // This tells Vite to apply this plugin during the build process
      closeBundle() {
        const buildInfoContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Build Information</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
          }
          h1 {
            font-size: 24px;
          }
          p {
            font-size: 18px;
          }
          .metadata {
            margin-top: 20px;
            font-family: Arial, sans-serif;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <h1>Build Information</h1>
        <div class="metadata">
          ${commitInfo}
        </div>
      </body>
      </html>
      `;

        // Write the build.html file to the output directory
        const outputPath = resolve(__dirname, "dist", "build.html");
        writeFileSync(outputPath, buildInfoContent);
      },
    };
  } else {
    return {
      name: "skip-build-info",
      apply: "build",
      closeBundle() {
        console.log("Skipping build.html generation in non-CI environment");
      },
    };
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), generateBuildInfo()],
});
