# Bloqboard Lending Wallet

## Situation overview

Bloqboard, a non-custodial Digital Asset Lending Platform powered by decentralized finance protocols Dharma and Compound, provides the ability to borrow and lend certain ERC-20 tokens. Bloqboard enables two types of loans: 1) peer-to-peer loans via Dharma protocol and 2) borrow and lend on liquidity pools via Compound protocol. The web application fulfills the needs of the average cryptocurrency trader or investor but is harder to run algorithmic trading strategies. This is where **Bloqboard Lending Wallet** comes in. We provide the first opportunity to engage in on-chain lending over an API in a non-custodial manner.

## Description
Bloqboard provides sophisticated cryptocurrency traders access to peer-to-peer and liquidity pool loans via a local API. The proposed API can also be used to provide borrowing/lending of tokens to customers of exchanges and allows aforementioned parties to keep custody of their assets. The solution is the Bloqboard Lending Wallet, open-source software that runs on the server of your choice to enable interaction with Compound and Dharma protocol smart contracts (MakerDAO support to come shortly). Additionally, the [Kyber network integration](https://github.com/bloqboard/bloqboard-lending-wallet/wiki/Kyber-Network-integration) automatically assists with dust and fee repayment of borrowed assets. The proposed solution can be accessed via API or the autogenerated web interface (Swagger) as seen below.

![homescreen](https://github.com/bloqboard/bloqboard-lending-wallet/blob/master/swagger_GUI.png)

The solution works on the Ethereum Mainnet and Kovan networks.

This solution is provided without any warranties and it may contain bugs. Users of this software are responsible for any losses that can occur during use.

![homescreen](https://github.com/bloqboard/bloqboard-lending-wallet/blob/master/visual_workflow.png)


## Prerequisites
1. Install [Node.js](https://nodejs.org/en/) on your machine (tested with v8.10.0)
2. [Create an Ethereum account](https://www.myetherwallet.com/) or use existing
3. Transfer some tokens to this account. Currently supported tokens: WETH, DAI, ZRX, REP and BAT
4. Extract private key from your Ethereum account. This can be done on myetherwallet.com for example

## Installation
From the project directory run the next command:
```bash
$ npm install
```

## Running the app

Paste a private key from your Ethereum account in `resources/account.json` file.

To start the app with Mainnet config, run the following command in the console:

```bash
$ NETWORK=mainnet npm run start
```

The app in now running on `localhost:3000/api` and you can interact with the app using [Swagger UI](http://localhost:3000/api/)

## Test

Run E2E tests
```bash
$ npm run test:e2e
```

## Contacts:
support@bloqboard.com
