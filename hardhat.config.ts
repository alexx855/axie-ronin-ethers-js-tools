import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import account from "./scripts/account";
import buyAxie from "./scripts/buy-axie";
import listAllAxies from "./scripts/list-all-axies";
import listAxie from "./scripts/list-axie";
import sendRON from "./scripts/send-ron";
import transferAllAxies from "./scripts/transfer-all-axies";
import transferAxie from "./scripts/transfer-axie";
import unlistAllAxies from "./scripts/unlist-all-axies";
import unlistAxie from "./scripts/unlist-axie";
import generateMartketplaceAccessToken from "./scripts/hardhat/generate-access-token";

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

task('account', 'Get account info')
  .addOptionalParam('address', 'The address to get info, default is the first account')
  .setAction(account)

task('generate-access-token', 'Generate an access token for the marketplace')
  .setAction(({ }, hre) => generateMartketplaceAccessToken(hre))

task('send', 'send ron to account')
  .addParam('to', 'The address to send RON')
  .addParam('ammount', 'The amount of RON to send')
  .setAction(sendRON)

task('buy', 'Buy an axie on the marketplace')
  .addParam('axie', 'The axie ID without #')
  .setAction(buyAxie)

task('unlist', 'Unlist an axie on the marketplace')
  .addParam('axie', 'The axie ID without #')
  .setAction(unlistAxie)

task('list', 'List an axie on the marketplace')
  .addParam('axie', 'The axie ID without #')
  .addParam('basePrice', 'The start price like the marketplace, example: 0.1')
  .addOptionalParam('endedPrice', 'The end price like the marketplace, example: 0.01')
  .addOptionalParam('duration', 'The duration of the aution in days')
  .setAction(listAxie)

task('list-all', 'List all axies on the marketplace')
  .addParam('basePrice', 'The start price like the marketplace, example: 0.1')
  .addOptionalParam('endedPrice', 'The end price like the marketplace, example: 0.01')
  .addOptionalParam('duration', 'The duration of the aution in days')
  .setAction(listAllAxies)

task('unlist-all', 'Unlist all axies on the marketplace')
  .setAction(unlistAllAxies)

task('transfer-axie', 'Transfer an axie to another account address')
  .addParam('axie', 'The axie ID without #')
  .addParam('address', 'The address to transfer the axie to')
  .setAction(transferAxie)

task('transfer-all-axies', 'Transfer all axies to another account address')
  .addParam('address', 'The address to transfer the axie to')
  .addOptionalParam('axies', 'The axies ID without #, separated by comma')
  .setAction(transferAllAxies)

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  solidity: "0.8.18",
  defaultNetwork: 'ronin',
  networks: {
    ronin: {
      chainId: 2020,
      url: 'https://api-gateway.skymavis.com/rpc',
      httpHeaders: {
        'x-api-key': process.env.SKIMAVIS_DAPP_KEY!
      },
      accounts: [process.env.PRIVATE_KEY!]
    },
    saigon: {
      chainId: 2021,
      url: 'https://saigon-testnet.roninchain.com/rpc',
      httpHeaders: {
        'x-api-key': process.env.SKIMAVIS_DAPP_KEY!
      },
      accounts: [process.env.PRIVATE_KEY!]
    }
  }
}

export default config
