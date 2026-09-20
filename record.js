import fs from 'fs';
import { execSync } from 'child_process';

const task = process.argv.slice(2).join(' ') || 'Progress update';
const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
const logEntry = `\n- [x] ${timestamp} — ${task}`;

const specPath = './PROJECT_SPEC.md';

if (fs.existsSync(specPath)) {
  let content = fs.readFileSync(specPath, 'utf-8');
  if (!content.includes('## Auto-Recorded Progress Log')) {
    content += '\n\n## Auto-Recorded Progress Log\n';
  }
  content += logEntry;
  fs.writeFileSync(specPath, content, 'utf-8');
  console.log(`\x1b[32m✔ Logged to PROJECT_SPEC.md:\x1b[0m ${task}`);
}

try {
  console.log('\x1b[36mPushing changes to GitHub & Vercel...\x1b[0m');
  execSync('git add .', { stdio: 'inherit' });
  execSync(`git commit -m "feat: ${task}"`, { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('\x1b[32m✔ All changes committed and pushed successfully!\x1b[0m');
} catch (err) {
  console.error('\x1b[31mGit push encountered an issue or no changes to commit.\x1b[0m');
}