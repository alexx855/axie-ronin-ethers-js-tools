# Axie Ronin Hardhat Task

This repository provides a set of example Hardhat tasks, to interact with the Ronin network.

## Available Hardhat tasks

- `npx hardhat accounts` - lists the balances of all accounts that are available in the Hardhat network.
- `npx hardhat send --to $ADDRESS --amount $AMOUNT` - sends a specific amount of RON to a specific address.
- `npx hardhat generate-access-token` - generates a marketplace access token, which is required to interact with the marketplace.
- `npx hardhat list-all` - lists all Axies on your account on the marketplace.
- `npx hardhat unlist-all` - removes all Axies from the marketplace.
- `npx hardhat list --axie $AXIE_ID --base-price 0.1 --ended-price 0.2 --duration 1` - lists a specific Axie on the marketplace, with a starting price, ending price, and duration.
- `npx hardhat unlist --axie $AXIE_ID` - removes a specific Axie from the marketplace.
- `npx hardhat buy --axie $AXIE_ID` - buys a specific Axie from the marketplace.

### How to use

Copy the `.env.example` file to `.env` and fill in your account private key (you can get this from the Ronin wallet). Please not share your private key with anyone.

Install the dependencies

```shell
npm install
```

### Taks examples

```shell
npx hardhat account
npx hardhat send --to 0x1234 --amount 1
npx hardhat list-all
npx hardhat list --axie 123456 --base-price 0.1 --ended-price 0.2 --duration 1
npx hardhat list --axie 123456 --base-price 0.1 
npx hardhat transfer-axie --axie 11683317 --address ronin:6e42b2baab99084a6ae3ee397c6bedce6fbad47f
npx hardhat transfer-all-axies --address ronin:6e42b2baab99084a6ae3ee397c6bedce6fbad47f
npx hardhat transfer-all-axies --axies "11683317,10947093" --address ronin:6e42b2baab99084a6ae3ee397c6bedce6fbad47f
npx hardhat unlist --axie 123456
npx hardhat unlist-all
npx hardhat buy --axie 123456
```
