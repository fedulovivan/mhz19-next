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
        "airbnb",
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
        "prefer-arrow-callback": "off",
        "object-shorthand": "off",
        "import/extensions": "off",
        "import/order": "warn",
        "arrow-body-style": "off",
        "arrow-parens": "off",
        "import/prefer-default-export": "off",
        "max-classes-per-file": "off",
        "react/jsx-one-expression-per-line": "off",
        "camelcase": "off",
        "space-before-function-paren": "off",
        "func-names": "off",
        "spaced-comment": "off",
    },
    plugins: [
        "@typescript-eslint",
        "react"
    ],
    settings: {
        react: {
            version: "detect"
        },
        "import/resolver": {
            // a way to tell eslint-plugin-import how to load aliased paths
            // settings for eslint-import-resolver-alias
            alias: {
                map: [
                    ["app", "./"]
                ],
                extensions: [".js", ".jsx", ".ts", ".tsx"]
            }
        }
    },
}