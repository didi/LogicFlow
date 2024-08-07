import fs from 'fs';
import path from 'path';
import generatePlaygroundJson from './generate-playground-json.mjs'

function copyPlaygroundJson() {
  return new Promise((resolve) => {
    const configPath = path.resolve('examples/config.json');
    const targetDir = path.resolve('examples');
    let configJson = fs.readFileSync(configPath, 'utf8');
    if (configJson) {
      // fs.writeFileSync('config.json')
      configJson = JSON.parse(configJson);
      const examples = configJson.examples;
      examples.forEach((example) => {
        const exampleJsonPath = path.resolve(targetDir, `${example.key}.playground.json`)
        const jsonObjct = generatePlaygroundJson(example.key)
        fs.writeFileSync(exampleJsonPath, JSON.stringify(jsonObjct));
      });
    }
    resolve()
  })
}

export default function playgroundJson() {
  return {
    name: 'playgroundJson',
    buildStart: async () => {
      await copyPlaygroundJson()
    }
  }
}