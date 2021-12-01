const fs = require('fs');
const swcConfig = JSON.parse(fs.readFileSync(`${__dirname}/.test.swcrc`, "utf-8"));

module.exports = {
  globalSetup: `${__dirname}/integration-test/setup.ts`,
  moduleFileExtensions: [
    "js",
    "json",
    "ts"
  ],
	testPathIgnorePatterns: [
		"dist",
	],
  testRegex: ".*\\.test\\.ts$",
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest", swcConfig],
  },
  testEnvironment: "node"
};
