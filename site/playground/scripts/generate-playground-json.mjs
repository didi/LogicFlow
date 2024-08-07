import path from 'path';
import fs from 'fs';

export default function generatePlaygroundJson(name) {
  const playgroundPath = path.resolve(
    'playground',
    '../examples',
    name
  );
  const files = fs.readdirSync(playgroundPath);
  const jsonFiles = {}

  files.forEach((file) => {
    const filePath = path.resolve(playgroundPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    jsonFiles[file] = {
      content
    };
  });
  const jsonObject = {
    files: jsonFiles
  }
  return jsonObject;
}
