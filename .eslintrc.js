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
        "airbnb",
        "eslint:recommended",
        "plugin:react/recommended",
    ],
    rules: {
        "no-unused-vars": "warn",
        "react/prop-types": "off",
        "indent": ["warn", 4],
        "react/jsx-indent": ["warn", 4],
        "react/jsx-indent-props": ["warn", 4],
        "react/jsx-filename-extension": ["warn", { "extensions": [".js", ".jsx", ".tsx"] }],
        "padded-blocks": "off",
        "comma-dangle": "off",
    },
    plugins: [
        "@typescript-eslint",
        "react"
    ],
    settings: {
        react: {
            version: "detect"
        }
    },
}