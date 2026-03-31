const path = require('path');
const fs = require('fs-extra');

const dataDir = path.join(__dirname, '..', 'data');
const files = {
  users: path.join(dataDir, 'users.json'),
  stores: path.join(dataDir, 'stores.json'),
  transactions: path.join(dataDir, 'transactions.json')
};

function ensureDataFiles() {
  fs.ensureDirSync(dataDir);
  Object.values(files).forEach((file) => {
    if (!fs.existsSync(file)) {
      fs.writeJsonSync(file, [], { spaces: 2 });
    }
  });
}

function readJson(filePath) {
  ensureDataFiles();
  return fs.readJsonSync(filePath, { throws: false }) || [];
}

function writeJson(filePath, data) {
  ensureDataFiles();
  fs.writeJsonSync(filePath, data, { spaces: 2 });
}

module.exports = {
  files,
  ensureDataFiles,
  readJson,
  writeJson
};
