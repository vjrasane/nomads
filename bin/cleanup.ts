import filter from 'oh-my-glob';
import { join } from 'path';
import { prompt } from 'enquirer';
import { rmSync } from 'fs';

const rootDir = join(__dirname, '..');

const cleanup = async () => {
  const files = filter(rootDir, [
    '*.log',
    'package-lock.json',
    '**/*.js',
    '**/*.d.ts',
    '**/*.d.ts.map',
    '!node_modules',
    '!coverage',
    '!vscode',
  ]);

  console.log(files.join('\n'));

  const answer = await prompt<{
    question: boolean;
  }>({
    type: 'confirm',
    name: 'question',
    message: 'Above files will be removed. Continue?',
  });

  if (answer.question) {
    files.forEach((file) => rmSync(file));
    console.log('Files removed');
    return;
  }
  console.log('Cancelled');
};

cleanup();
