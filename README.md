<div align="center">
<img src="https://raw.githubusercontent.com/tonvault/tonconnect-manifest/main/apple-icon.svg" alt="Ton Vault Logo">
</div>

# Ton Vault Backend
Check details about Ton Vault Protocol in  [official documentation](https://tonvault.gitbook.io/docs/).

# Bootstrapping
## Requirements
```bash
$ node -v
v18.13.0
$ npm -v
8.19.3
$ nest -v
9.1.2
```
```bash
$ npm install
```

After installation create `.env` file in root directory. You can find an example of config in
`.env.example` file.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Linter

```bash
npm run lint
```


