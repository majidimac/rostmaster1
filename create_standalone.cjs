const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Run the build command
console.log('Running vite build...');
execSync('npm run build', { stdio: 'inherit' });

// 2. Define paths
const distPath = path.join(__dirname, 'dist');
const assetsPath = path.join(distPath, 'assets');
const htmlPath = path.join(distPath, 'index.html');
const outputPath = path.join(__dirname, 'standalone_app.html');

// 3. Read the main HTML file
console.log('Reading index.html...');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 4. Find and inline the CSS
const cssFile = fs.readdirSync(assetsPath).find(f => f.endsWith('.css'));
if (cssFile) {
  console.log(`Inlining ${cssFile}...`);
  const cssPath = path.join(assetsPath, cssFile);
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const cssTag = `<style>${cssContent}</style>`;
  htmlContent = htmlContent.replace(/<link[^>]+rel="stylesheet"[^>]+>/, cssTag);
} else {
  console.log('No CSS file found to inline.');
}

// 5. Find and inline the JavaScript
const jsFile = fs.readdirSync(assetsPath).find(f => f.endsWith('.js'));
if (jsFile) {
  console.log(`Inlining ${jsFile}...`);
  const jsPath = path.join(assetsPath, jsFile);
  const jsContent = fs.readFileSync(jsPath, 'utf8');
  // Prepend "module" to the script tag to ensure it's treated as a module
  const jsTag = `<script type="module">${jsContent}</script>`;
  // Use a more robust regex to find and replace the script tag
  htmlContent = htmlContent.replace(/<script type="module" crossorigin src=".*?"><\/script>/, jsTag);
} else {
  console.log('No JS file found to inline.');
}

// 6. Write the final standalone file
console.log(`Writing to ${outputPath}...`);
fs.writeFileSync(outputPath, htmlContent, 'utf8');

console.log('Standalone file created successfully!');
