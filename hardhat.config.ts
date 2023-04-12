import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import * as fs from 'fs/promises'
import {
  CONTRACT_WETH_ADDRESS,
  CONTRACT_AXIE_ADDRESS,
  CONTRACT_AXIE_ABI_JSON_PATH,
} from "./lib/constants";

dotenv.config()

export type AvailableNetworks = 'ronin' | 'saigon'

task('account', 'Get info of the deployer account', async (taskArgs, hre) => {
  if (hre.network.name != 'ronin' && hre.network.name != 'saigon') {
    throw new Error('Network not supported')
  }

  try {
    const network: AvailableNetworks = hre.network.name
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    const address = signer.address.toLowerCase()
    console.log('Address:', address.replace('0x', 'ronin:'))

    // get RON balance
    const balance = await hre.ethers.provider.getBalance(address)
    const balanceInEther = hre.ethers.utils.formatEther(balance)
    console.log('RON:', balanceInEther)

    // get WETH balance
    const wethABI = JSON.parse(await fs.readFile(CONTRACT_AXIE_ABI_JSON_PATH, 'utf8'))
    const wethContract = new hre.ethers.Contract(CONTRACT_WETH_ADDRESS[network], wethABI, signer)
    const wethBalance = await wethContract.balanceOf(address)
    const wethBalanceInEther = hre.ethers.utils.formatEther(wethBalance)
    console.log('WETH:', wethBalanceInEther)

    // get axie contract
    const axieABI = JSON.parse(await fs.readFile(CONTRACT_AXIE_ABI_JSON_PATH, 'utf8'))
    const axieContract = await new hre.ethers.Contract(CONTRACT_AXIE_ADDRESS[network], axieABI, signer)

    // get axies balance for the address
    const axiesBalance = await axieContract.balanceOf(address)
    console.log('Axies:', hre.ethers.BigNumber.from(axiesBalance).toString())

    // get USDC balance
    const usdcABI = JSON.parse(await fs.readFile(CONTRACT_AXIE_ABI_JSON_PATH, 'utf8'))
    const usdcContract = new hre.ethers.Contract(CONTRACT_WETH_ADDRESS[network], usdcABI, signer)
    const usdcBalance = await usdcContract.balanceOf(address)
    const usdcBalanceInEther = hre.ethers.utils.formatUnits(usdcBalance, 6)
    console.log('USDC balance: ', usdcBalanceInEther)
  } catch (error) {
    console.error(error)
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
