module.exports = {
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testRegex: "tests/.+\\.(e2e-)?spec\\.ts$",
  moduleDirectories: ["node_modules", "lib"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: ["lib/**/*.ts"],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
  setupFiles: ["./tests/setup.ts"],
  notify: true,
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.test.json",
    },
  },
};
