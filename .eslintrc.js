module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true,
        jest: true,
        node:true,
    },
    "extends": "eslint:recommended", 
    globals: {
        process: true,
        Buffer: true,
      },
    "plugins": ["jest"],
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
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
    }
}