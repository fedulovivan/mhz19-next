module.exports = {
    presets: [
        "@babel/typescript",
        ["@babel/preset-env", {
            targets: {
                node: 'current'
            }
        }],
    ],
    extensions: [
        ".js",
        ".ts",
    ],
    "plugins": [
        [
            // a way to tell babel how to load aliased paths
            // settings for babel-plugin-module-resolver
            "module-resolver",
            {
                "alias": {
                    "app": "./"
                }
            }
        ]
    ],
}
