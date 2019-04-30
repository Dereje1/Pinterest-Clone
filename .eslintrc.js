module.exports = {
    'env': {
      'browser': true,
      'commonjs': true,
      'es6': true,
      'node': true,
      'jest': true
    },
    'extends': [
      'airbnb',
      'plugin:react/recommended',
    ],
    parser: 'babel-eslint',
    'plugins': [
      'react'
    ],
    'rules': {
      'import/first': [
        'error',
        'DISABLE-absolute-first'
      ],
      'indent': [
        'error',
        2,
        { 'SwitchCase': 1 }
      ],
      "jsx-a11y/anchor-is-valid": [ "error", {
        "components": [ "Link" ],
        "specialLink": [ "to" ]
      }],
      'no-console': 0,
      'no-underscore-dangle': ["error", { "allow": ["_id","_d","_doc"] }],
      'padded-blocks': ['error', {
        'blocks': 'never',
        'classes': 'always',
        'switches': 'never'
      }],
      'react/jsx-filename-extension': [
        1,
        { 'extensions': ['.js', '.jsx'] }
      ],
      'react/jsx-uses-vars': [2],
      'linebreak-style': ["error",process.env.OS==='Windows_NT' ? "windows" : "unix"],
      'react/no-did-update-set-state': 0,
      'no-param-reassign': ["error", { "props": true, "ignorePropertyModificationsFor": ["user","req","res"] }],
    }
  };