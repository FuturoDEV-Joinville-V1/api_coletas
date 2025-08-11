
const fs = require('fs-extra');

async function readJSON(path, defaultValue=[]) {
  try {
    const exists = await fs.pathExists(path);
    if(!exists) return defaultValue;
    return await fs.readJSON(path);
  } catch (e) {
    return defaultValue;
  }
}

async function writeJSON(path, data) {
  await fs.writeJSON(path, data, { spaces: 2 });
}

module.exports = { readJSON, writeJSON };
