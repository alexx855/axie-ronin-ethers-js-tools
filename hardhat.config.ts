import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import generateMartketplaceAccessToken from "./scripts/generate-access-token";
import sendRON from "./scripts/send-ron";
import account from "./scripts/account";

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

task('account', 'Get info of the deployer account', account)

task('send', 'send ron to account')
  .addParam('to', 'The address to send RON')
  .addParam('ammount', 'The amount of RON to send')
  .setAction(sendRON)

task('generate-access-token', 'Generate marketplace access token', generateMartketplaceAccessToken)

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  solidity: "0.8.18",
  defaultNetwork: 'ronin',
  networks: {
    ronin: {
      chainId: 2020,
      url: 'https://api.roninchain.com/rpc',
      accounts: [process.env.PRIVATE_KEY!]
    },
    saigon: {
      chainId: 2021,
      url: 'https://saigon-testnet.roninchain.com/rpc',
      accounts: [process.env.PRIVATE_KEY!]
    }
  }
}

export default config
