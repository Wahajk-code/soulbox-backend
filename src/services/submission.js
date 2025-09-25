const fs = require("fs").promises;
const path = require("path");

const submissionsFile = path.join(__dirname, "../data/submissions.json");

async function saveSubmission(submission) {
  try {
    let submissions = [];
    try {
      const data = await fs.readFile(submissionsFile, "utf8");
      if (data.trim()) {
        // Check if file is not empty
        submissions = JSON.parse(data);
        if (!Array.isArray(submissions)) {
          console.warn("submissions.json is not an array, resetting to []");
          submissions = [];
        }
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("submissions.json not found, creating new file");
      } else if (error.message.includes("Unexpected end of JSON input")) {
        console.warn("submissions.json is empty or invalid, resetting to []");
      } else {
        throw error;
      }
    }

    submissions.push(submission);
    await fs.writeFile(submissionsFile, JSON.stringify(submissions, null, 2));
  } catch (error) {
    console.error("Failed to save submission:", error.message, error.stack);
    throw new Error("Failed to save submission: " + error.message);
  }
}

module.exports = { saveSubmission };
