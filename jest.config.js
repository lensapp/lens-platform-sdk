const fs = require('fs');
const swcConfig = JSON.parse(fs.readFileSync(`${__dirname}/.test.swcrc`, "utf-8"));

module.exports = {
  testPathIgnorePatterns: [
    "dist",
    "integration-test"
  ],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest", swcConfig],
  },
  testEnvironment: "node"
};
