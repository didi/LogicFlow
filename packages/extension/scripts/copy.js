const { copyFile, statSync, mkdirSync, existsSync, readdir } = require('fs');
const path = require('path');

const copyFolder = async (src, dst) => {
  readdir(src, (err, files) => {
    if (!err) {
      if (!existsSync(dst)) mkdirSync(dst);
      files.forEach((file) => {
        const srcPath = path.join(src, file);
        const dstPath = path.join(dst, file);
        const status = statSync(srcPath);
        if (status.isFile()) {
          copyFile(srcPath, dstPath, (err) => {
            if (err) {
              console.log(err);
              process.exit(1);
            }
          });
        } else if (status.isDirectory()) {
          copyFolder(srcPath, dstPath);
        }
      });
    } else {
      console.log(err);
      process.exit(1);
    }
  });
};

const targetDirs = ['../cjs/style', '../es/style', '../lib/style'];
const sourceDir = path.resolve(__dirname, '../src/style');

targetDirs.forEach((dir) => {
  copyFolder(sourceDir, path.resolve(__dirname, dir));
});
