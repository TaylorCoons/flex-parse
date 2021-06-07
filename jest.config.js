// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testMatch: [
        "**/test/**/*.ts"
    ],
    testPathIgnorePatterns: [
        "node_modules",
        "build"
    ]
};