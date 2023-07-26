<div align="center">
<img src="https://raw.githubusercontent.com/tonvault/tonconnect-manifest/main/apple-icon.svg" alt="Ton Vault Logo">
</div>

# Ton Vault Backend
Check details about Ton Vault Protocol in  [official documentation](https://tonvault.gitbook.io/docs/).

# Bootstrapping
## Requirements
> - [MongoDB](https://www.mongodb.com/)
> - Bootstrapped [storage-daemon](https://docs.ton.org/participate/ton-storage/storage-daemon)
> - [storage-daemon-cli](https://docs.ton.org/participate/ton-storage/storage-daemon#starting-the-storage-daemon-and-storage-daemon-cli)

Specify URI to Mongo and routes to Ton Storage tools in `.env` file using `.env.example` file.

Make sure that you have installed [Node.js](https://nodejs.org/en/), [NPM](https://www.npmjs.com/) on your machine.

```bash
$ node -v
v18.13.0
$ npm -v
8.19.3
$ nest -v #(Optional)
9.1.2
```
And install dependencies:
```bash
$ npm install
```

After installation don't forget to create `.env` file in root directory. You can find an example of config in
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


