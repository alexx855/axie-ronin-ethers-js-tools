# Axie Ronin Hardhat Task

This repository provides a set of Hardhat tasks that make it easier for developers to interact with their Axies on the Ronin network.

For example, you can easily list all your axies at once, buy an Axies from the marketplace, and view your account balances.

## Available Hardhat tasks

- `npx hardhat accounts` - lists the balances of all accounts that are available in the Hardhat network.
- `npx hardhat generate-access-token` - generates a marketplace access token, which is required to interact with the Axie Ronin marketplace.
- `npx hardhat listall` - lists all Axies on your account and calculates the price of each Axie based on similar listings and Axie rarity.
- `npx hardhat list --axie $AXIE_ID --base-price 0.1 --ended-price 0.2 --duration 1` - lists a specific Axie on the marketplace, with a starting price, ending price, and duration.
- `npx hardhat unlist --axie $AXIE_ID` - removes a specific Axie from the marketplace.
- `npx hardhat buy --axie $AXIE_ID` - allows you to buy a specific Axie from the marketplace.
