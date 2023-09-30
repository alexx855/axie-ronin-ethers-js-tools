import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { getAxieContract, getUSDCContract, getWETHContract } from "../lib/contracts"

export default async function account(taskArgs: {}, hre: HardhatRuntimeEnvironment) {
  if (hre.network.name != 'ronin' && hre.network.name != 'saigon') {
    throw new Error('Network not supported')
  }
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
    const wethContract = await getWETHContract(hre.ethers.provider)
    const wethBalance = await wethContract.balanceOf(address)
    const wethBalanceInEther = hre.ethers.utils.formatEther(wethBalance)
    console.log('WETH:', wethBalanceInEther)

    // get axie contract
    const axieContract = await getAxieContract(hre.ethers.provider)

    // get axies balance for the address
    const axiesBalance = await axieContract.balanceOf(address)
    console.log('Axies:', hre.ethers.BigNumber.from(axiesBalance).toString())

    // get USDC balance
    const usdcContract = await getUSDCContract(hre.ethers.provider)
    const usdcBalance = await usdcContract.balanceOf(address)
    const usdcBalanceFormated = hre.ethers.utils.formatUnits(usdcBalance, 6)
    console.log('USDC balance: ', usdcBalanceFormated)
  } catch (error) {
    console.error(error)
  }
}
