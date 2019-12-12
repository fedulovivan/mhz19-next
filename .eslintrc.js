module.exports = {
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module"
    },
    env: {
        node: true,
        browser: true
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    rules: {
        "no-unused-vars": "warn"
    },
    plugins: [
        "react"
    ],
    settings: {
        react: {
            version: "detect"
        }
    }
}