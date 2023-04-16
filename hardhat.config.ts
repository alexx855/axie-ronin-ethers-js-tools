import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import generateMartketplaceAccessToken from "./scripts/generate-access-token";
import sendRON from "./scripts/send-ron";
import account from "./scripts/account";

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { listAxie } from "./scripts/list-axie";
import { unlistAxie } from "./scripts/unlist-axie";
dotenv.config()

task('account', 'Get info of the deployer account', account)

task('send', 'send ron to account')
  .addParam('to', 'The address to send RON')
  .addParam('ammount', 'The amount of RON to send')
  .setAction(sendRON)

task('generate-access-token', 'Generate marketplace access token', generateMartketplaceAccessToken)

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
  .setAction(async (taskArgs: {
    basePrice: string
    endedPrice?: string
    duration?: string
    gasLimit?: number
  }, hre) => {
    // get address
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    const address = signer.address.toLowerCase()
    console.log(`Listing all axies of ${address.replace('0x', 'ronin:')}`)

    const axieIds = await getAxieIds(hre)
    for (let i = 0; i < axieIds.length; i++) {
      const axieId = axieIds[i]
      await listAxie({ axie: axieId.toString(), ...taskArgs }, hre)
    }
  })

task('unlist-all', 'Unlist all axies on the marketplace', async (taskArgs: {}, hre) => {
  // get address
  const accounts = await hre.ethers.getSigners()
  const signer = accounts[0]
  const address = signer.address.toLowerCase()
  console.log(`Unlisting all axies of ${address.replace('0x', 'ronin:')}`)

  const axieIds = await getAxieIds(hre)
  for (let i = 0; i < axieIds.length; i++) {
    const axieId = axieIds[i]
    await unlistAxie({ axie: axieId.toString() }, hre)
  }
})

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
