// jest.config.js
// jest.config.js
module.exports = {
  moduleFileExtensions: ["js", "json", "vue"],
  transform: {
    "^.+\\.js$": "babel-jest",
    ".*\\.(vue)$": "vue-jest",
  },
  testEnvironment: "jsdom",
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,vue}",
    "!src/main.js",
    "!src/router/index.js",
  ],
  coverageReporters: ["html", "text-summary"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // 注意不要有反斜線，僅用正斜線
  },
};
