import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { CONTRACT_AXIE_ABI_JSON_PATH, CONTRACT_WETH_ADDRESS, CONTRACT_AXIE_ADDRESS, AvailableNetworks } from "../lib/constants"
import * as fs from 'fs/promises'

export default async function account(taskArgs: {}, hre: HardhatRuntimeEnvironment) {
  if (hre.network.name != 'ronin' && hre.network.name != 'saigon') {
    throw new Error('Network not supported')
  }
  const network: AvailableNetworks = hre.network.name
  try {
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
}
