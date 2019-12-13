module.exports = {
    parser: "@typescript-eslint/parser",
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
        "@typescript-eslint",
        "react"
    ],
    settings: {
        react: {
            version: "detect"
        }
    }
}