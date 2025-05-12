const fs = require("fs").promises;
const path = require("path");
const HttpError = require("./HttpError");

async function deleteFolderRecursive(folderPath) {
  try {
    // Overíme, či adresár existuje
    const files = await fs.readdir(folderPath);

    for (const file of files) {
      const currentPath = path.join(folderPath, file);

      const stat = await fs.lstat(currentPath);
      if (stat.isDirectory()) {
        // Rekurzívne zmažeme priečinok
        await deleteFolderRecursive(currentPath);
      } else {
        // Zmažeme súbor
        await fs.unlink(currentPath);
      }
    }

    // Zmažeme prázdny priečinok
    await fs.rmdir(folderPath);
  } catch (err) {
    throw new HttpError("Nepodarilo sa vymazať adresár");
  }
}

module.exports = deleteFolderRecursive;
