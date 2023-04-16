import type { HardhatRuntimeEnvironment } from "hardhat/types"

export default async function sendRON(taskArgs: {
  to: string
  amount: string
}, hre: HardhatRuntimeEnvironment) {
  try {
    // check if to is valid
    if (!hre.ethers.utils.isAddress(taskArgs.to)) {
      throw new Error('Invalid address')
    }

    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    const addressFrom = signer.address.toLowerCase()
    console.log('AddressFrom:', addressFrom)
    console.log('AddressTo:', taskArgs.to)

    // get RON balance
    const balance = await hre.ethers.provider.getBalance(addressFrom)
    const balanceInEther = hre.ethers.utils.formatEther(balance)
    console.log('RON:', balanceInEther)

    // check if balance is enough
    if (hre.ethers.utils.parseEther(taskArgs.amount).gt(balance)) {
      throw new Error('Not enough RON')
    }

    // send RON to address
    console.log('Sending RON to:', taskArgs.to)
    const tx = await signer.sendTransaction({
      to: taskArgs.to,
      value: hre.ethers.utils.parseEther(taskArgs.amount)
    })

    console.log('Tx:', tx.hash)
  } catch (error) {
    console.error(error)
  }
}
