# Axie ronin devkit

This repository provides a set of utilities and examples to interact with the Ronin network and the Axie Infinity marketplace.

## How to use

Install the dependencies

```shell
npm install axie-ronin-devkit ethers@5.7.0 dotenv
```

Generate a wallet and provider, which will be used to interact with the Ronin network using ethers.js

```typescript
import { ethers } from 'ethers';
import * as dotenv from 'dotenv'
dotenv.config()

// see https://docs.skymavis.com/api/rpc
const connection = {
  url: 'https://api-gateway.skymavis.com/rpc',
  headers: {
      'x-api-key': 'xxxxx' // get from https://developers.skymavis.com/console/applications/
  }
}
const provider = new ethers.providers.JsonRpcProvider(connection);

// Import the wallet private key from the environment
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!)
await wallet.connect(provider)
```

### Generate a marketplace access token, which is required to interact with the marketplace

```typescript
import { generateAccessTokenMessage, exchangeToken } from 'axie-ronin-ethers-js-tools';

const getMarketplaceAccessToken = async (): Promise<string> => {
  // Get address from signer
  const address = await wallet.getAddress()
  // Generate message to sign
  const domain = `example.com`
  const uri = "https:/example.com"
  const statement = `any statement`
  const message = await generateAccessTokenMessage(address, domain, uri, statement)
  // Sign the message
  const signature = await wallet.signMessage(message)
  // Exchange the signature for an access token
  const { accessToken } = await exchangeToken(signature, message)
  return accessToken
}

```

### List an axie for sale on the marketplace

```typescript
const createAxieSale = async () => {
  // 1 ETH in wei
  const basePrice = ethers.utils.parseUnits('1', 'ether').toString()
  // 0.5 ETH in wei
  const endedPrice = ethers.utils.parseUnits('0.5', 'ether').toString()
  // ID of the axie to list for sale on the marketplace
  const axieId = 9604431
  // Generate marketplace access token (see above)
  const accessToken = await getMarketplaceAccessToken()
  // Approve the axie contract to transfer axies from address to the marketplace contract
  const isApproved = await approveMarketplaceContract(address, wallet)
  // Get current block timestamp
  const currentBlock = await provider.getBlock('latest')
  const startedAt = currentBlock.timestamp
  const endedAt = 0 // 0 means no end time, use startedAt + duration for auctions
  // ~ 6 months default and max listing duration
  const expiredAt = startedAt + 15634800
  // Create the order
  const orderData = {
    address,
    axieId,
    basePrice,
    endedPrice,
    startedAt,
    endedAt,
    expiredAt,
  }
  // Wait for markeplace api result
  const skymavisApyKey = 'xxxxx' // get from https://developers.skymavis.com/console/applications/
  const result = await createMarketplaceOrder(orderData, accessToken, provider, skymavisApyKey)
}
```

### Unlist an axie from the marketplace

```typescript
import { cancelMarketplaceOrder } from "axie-ronin-ethers-js-tools";

const cancelAxieSale = async (axieId: number) => {
    // Wait for the transaction to be mined
    const skymavisApyKey = 'xxxxx' // get from https://developers.skymavis.com/console/applications/
    const receipt = await cancelMarketplaceOrder(axieId, wallet, skymavisApyKey)
}

```

### Buy an axie

```typescript
import { buyMarketplaceOrder } from "axie-ronin-ethers-js-tools";

const buyAxieFromMarketplace = async (axieId: number) => {
  // Get address from wallet
  const address = await wallet.getAddress()
  // Wait for the transaction to be mined
  const skymavisApyKey = 'xxxxx' // get from https://developers.skymavis.com/console/applications/
  const receipt = await buyMarketplaceOrder(axieId, address, provider, skymavisApyKey)
}
```

### Batch transfer all axies

This will transfer all axies ids from the wallet to the specified address, it uses the ERC721 Batch Transfer contract: <https://app.roninchain.com/address/0x2368dfed532842db89b470fde9fd584d48d4f644>


```typescript
import { getAxieIdsFromAccount, batchTransferAxies } from "axie-ronin-ethers-js-tools";

const batchTransferAllAxies = async (addressTo:string) => {
  // Get address from wallet
  const address = await wallet.getAddress()
  // get all axies ids from the account
  const axieIds = await getAxieIdsFromAccount(address, provider)
  const axies: string[] = axieIds.map((axieId) => {
    return axieId.toString()
  })
  // wait for tx to be mined and get receipt
  const receipt = await batchTransferAxies(addressFrom, addressTo, axies, wallet)
}

```

#### How to dev

Copy the `.env.example` file to `.env` and fill in your account private key (you can get this from the Ronin wallet). Please not share your private key with anyone.

```shell
npm install
npx hardhat account
npx hardhat generate-access-token
npx hardhat list --axie $AXIE_ID --base-price 0.1
npx hardhat list --axie $AXIE_ID --base-price 0.1 --ended-price 0.2 --duration 1
npx hardhat list-all --base-price 0.1
npx hardhat list-all --base-price 0.1 --ended-price 0.2 --duration 1
npx hardhat unlist --axie $AXIE_ID
npx hardhat unlist-all
npx hardhat buy --axie $AXIE_ID
npx hardhat transfer-axie --axie $AXIE_ID --address $ADDRESS
npx hardhat transfer-all-axies --address $ADDRESS
npx hardhat transfer-all-axies --address $ADDRESS --axies "$AXIE_ID,$AXIE_ID"
```

#### Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
