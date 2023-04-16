# Axie Ronin Hardhat Task

This repository provides a set of example Hardhat tasks, to interact with the Ronin network.

For example, you could easily list all your axies at once, buy an Axies from the marketplace, and view your account balances.

## Available Hardhat tasks

- `npx hardhat accounts` - lists the balances of all accounts that are available in the Hardhat network.
- `npx hardhat send --to $ADDRESS --amount $AMOUNT` - sends a specific amount of RON to a specific address.
- `npx hardhat generate-access-token` - generates a marketplace access token, which is required to interact with the Axie Ronin marketplace.
- `npx hardhat listall` - lists all Axies on your account and calculates the price of each Axie based on similar listings and Axie rarity.
- `npx hardhat list --axie $AXIE_ID --base-price 0.1 --ended-price 0.2 --duration 1` - lists a specific Axie on the marketplace, with a starting price, ending price, and duration.
- `npx hardhat unlist --axie $AXIE_ID` - removes a specific Axie from the marketplace.
- `npx hardhat buy --axie $AXIE_ID` - allows you to buy a specific Axie from the marketplace.

### Try running some of the following tasks

```shell
npx hardhat help
npx hardhat test --network saigon
npx hardhat run scripts/deploy.ts --network saigon
npx hardhat account
npx hardhat send --to 0x1234 --amount 1
npx hardhat generate-access-token
npx hardhat listall
npx hardhat unlist --axie 123456
npx hardhat list --axie 123456 --base-price 0.1 --ended-price 0.2 --duration 1
npx hardhat buy --axie 123456
```
