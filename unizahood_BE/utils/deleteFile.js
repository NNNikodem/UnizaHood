const fs = require("fs").promises;
const path = require("path");

/**
 * Delete a single file
 * @param {string} filePath - Path to the file to delete
 * @returns {Promise} - Resolves if deleted, rejects with error
 */
const deleteFile = async (filePath) => {
  try {
    // Skip if the file is null/undefined or is the default photo
    if (!filePath || filePath.includes("default.png")) {
      return { success: false, message: "No file to delete or default file" };
    }

    // Convert relative path to absolute if needed
    const fullPath = filePath.startsWith("/")
      ? path.join(__dirname, "..", filePath.substring(1))
      : filePath;

    // Check if file exists
    await fs.access(fullPath);

    // Delete the file
    await fs.unlink(fullPath);
    return { success: true, message: "File deleted successfully" };
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return { success: false, message: error.message };
  }
};

/**
 * Delete multiple files
 * @param {string[]} filePaths - Array of file paths to delete
 * @returns {Promise} - Resolves with results for each file
 */
const deleteFiles = async (filePaths) => {
  if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
    return { success: false, message: "No files to delete" };
  }

  const results = await Promise.all(
    filePaths.map(async (filePath) => {
      const result = await deleteFile(filePath);
      return { filePath, ...result };
    })
  );

  return {
    success: results.some((r) => r.success),
    results,
  };
};

module.exports = {
  deleteFile,
  deleteFiles,
};
