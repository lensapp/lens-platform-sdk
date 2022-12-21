const packageJson = require("./package.json");

module.exports = {
  ignorePatterns: ["**/node_modules/**/*", "**/dist/**/*", "**/static/**/*"],
  overrides: [
    {
      files: ["**/*.js"],
      extends: ["@lensapp/eslint-config"],
      env: {
        node: true,
      },
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
      },
      plugins: ["unused-imports", "simple-import-sort"],
    },
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      extends: ["@lensapp/eslint-config"],
      plugins: ["unused-imports", "react-hooks", "simple-import-sort"],
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
        project: "tsconfig.json",
      },
    },
    {
      files: ["**/*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["unused-imports", "react-hooks", "import", "simple-import-sort"],
      extends: ["@lensapp/eslint-config"],
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
        jsx: true,
        project: "tsconfig.json",
      },
    },
  ],
};
