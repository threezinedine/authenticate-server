module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    },
    transform: {
        '^.+\\.[t|j]sx?$': 'babel-jest',
    },
};
