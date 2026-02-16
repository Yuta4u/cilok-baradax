import { readFileSync } from 'fs';
import { join } from 'path';

// Read package.json to extract version
const packageJsonPath = join(__dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version || 'v?.?';

export function onInitAscii() {
  const banner = `
 ${version}
` as const;
  return banner;
}
