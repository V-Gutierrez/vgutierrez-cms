#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

// Single readline interface shared by callers
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer));
  });
}

async function askDefault(label, current) {
  const answer = await ask(`${label} (${current}): `);
  return answer && answer.length ? answer : current;
}

async function confirm(label, defaultValue = false) {
  const suffix = defaultValue ? 'Y/n' : 'y/N';
  const answer = (await ask(`${label} (${suffix}): `)).trim().toLowerCase();
  if (!answer) return !!defaultValue;
  return ['y', 'yes', 's', 'sim', 'true', '1'].includes(answer);
}

function parseList(input) {
  if (!input) return [];
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function editInEditor(initialContent = '', options = {}) {
  const { filePrefix = 'edit', extension = 'txt' } = options;
  const tmpDir = path.join(__dirname, '..', '.tmp');
  try {
    await fs.mkdir(tmpDir, { recursive: true });
  } catch (_) {}

  const tmpFile = path.join(
    tmpDir,
    `${filePrefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
  );
  await fs.writeFile(tmpFile, initialContent, 'utf8');

  const editor = process.env.VISUAL || process.env.EDITOR || (process.platform === 'win32' ? 'notepad' : 'nano');

  try {
    spawnSync(editor, [tmpFile], { stdio: 'inherit' });
  } catch (err) {
    // Fallback to simple multi-line input if editor cannot be launched
    console.log(`\nCould not launch editor "${editor}". Falling back to inline input.`);
    console.log('Enter content. Finish with a line containing only ".done"');
    const lines = [];
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const line = await ask('> ');
      if (line.trim() === '.done') break;
      lines.push(line);
    }
    return lines.join(os.EOL);
  }

  const content = await fs.readFile(tmpFile, 'utf8');
  try { await fs.unlink(tmpFile); } catch (_) {}
  return content;
}

function close() {
  rl.close();
}

module.exports = {
  ask,
  askDefault,
  confirm,
  parseList,
  editInEditor,
  close
};

