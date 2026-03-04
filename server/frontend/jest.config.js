module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
        '^/static/(.*)$': '<rootDir>/$1'
    },
    transform: {
        '^.+\\.[t|j]sx?$': 'babel-jest',
    },
};
