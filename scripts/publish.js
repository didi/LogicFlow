const inquirer = require('inquirer');
const pkg = require('../lerna.json');
const os = require('os');
const path = require('path');
const fs = require('fs');
const shell = require('shelljs');

const workRoot = path.join(__dirname, '..');
const resolve = (packge) => path.join(workRoot, packge);
const versions = [];

async function start() {
  const packages = await getPackages();
  await getVersionTypefromPackages(packages);
  const tasks = await generateTasks(packages, versions)
  await runPromises(tasks)
  commitAndChangeDependences(packages)
}

async function commitAndChangeDependences(packages) {
  const updatedMap = {}
  // 1. git add 发布包的changelog 和 package.json
  packages.forEach(package => {
    const packageJson = require(path.join(resolve(package), 'package.json'));
    updatedMap[packageJson.name] = packageJson.version;
    shell.exec(`git add ${path.join(resolve(package), 'package.json')} ${path.join(resolve(package), 'CHANGELOG.md')}`);
  });
  // 2. 各种包依赖的版本号
  pkg.packages.forEach(package => updatePackageDependencesVersion(package, updatedMap));
  shell.exec(`git commit -m 'chore(release): ${Object.keys(updatedMap).join(', ')}' -n`);
}

function updatePackageDependencesVersion(package, updatedMap) {
  const packageJson = require(path.join(resolve(package), 'package.json'));
  Object.keys(updatedMap).forEach((key) => {
    if(packageJson.dependencies && packageJson.dependencies[key]) {
      packageJson.dependencies[key] = `^${updatedMap[key]}`;
    }
    if(packageJson.devDependencies && packageJson.devDependencies[key]) {
      packageJson.devDependencies[key] = updatedMap[key];
    }
  })
  fs.writeFileSync(path.join(resolve(package), 'package.json'), `${JSON.stringify(packageJson, null, 2)}${os.EOL}`, 'utf8');
  shell.exec(`git add ${path.join(resolve(package), 'package.json')}`)
}

async function getPackages() {
  const promptList = [{
    type: "checkbox",
    message: "请选择要发布的包:",
    name: "packages",
    choices: [
      {
        name:  "packages/lf",
      },
      {
        name: "packages/lf-extension",
      }
    ]
  }];
  return inquirer
    .prompt(promptList)
    .then(answers => {
      return answers.packages;
    })
}

function generateTasks(packages, versions) {
  return packages.map((package, index) => {
    return () => new Promise((r) => {
      const realPath = resolve(package);
      shell.exec(`cd ${realPath} && npm run publish-lib`)
      r()
    })
  })
}

async function getVersionTypefromPackages(packages) {
  return runPromises(packages.map((package) => () => selectSingleVersion(package)));
}

function runPromises(promises) {
  return new Promise(r => {
    function next(index) {
      if(index >= promises.length) return r();
      promises[index]().then((r) => {
        next(index + 1)
      });
    }
    next(0);
  })
}

async function selectSingleVersion(package) {
  return inquirer
    .prompt([{
      type: "list",
      message: `请选择为${package}发布的包版本类型：`,
      name: "version",
      choices: ['patch', 'minor', 'major'].map((name) => ({name}))
    }])
    .then(answer => {
      versions.push(answer.version);
    })
}


start();