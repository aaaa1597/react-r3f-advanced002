module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "prettier"
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "react"
    ],
    "rules": {
        "@typescript-eslint/no-namespace": "off",
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",
        "react/no-unknown-property": ['error', { ignore: [
            'args', 'intensity', 'castShadow', 'shadow-bias', 'shadow-radius', 'shadow-blur', 'shadow-mapSize', 'position', 'rotation',
            'shadow-camera-left', 'shadow-camera-right', 'shadow-camera-top', 'shadow-camera-bottom', 'dispose', 'receiveShadow', 'geometry', 'material'] }],
    }
}
