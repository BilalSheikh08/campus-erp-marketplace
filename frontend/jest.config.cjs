module.exports = {
  testEnvironment: "jsdom",
  clearMocks: true,
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/src/testSetup.js"],
  moduleFileExtensions: ["js", "jsx", "json"],
};
