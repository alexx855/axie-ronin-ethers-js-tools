
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { CONTRACT_AXIE_ADDRESS, CONTRACT_AXIE_ABI_JSON_PATH, CONTRACT_ERC721_BATCH_TRANSFER_ADDRESS, CONTRACT_ERC721_BATCH_TRANSFER_ABI_JSON_PATH, AvailableNetworks } from "../lib/constants"
import * as fs from 'fs/promises'
import { ethers } from "ethers"

export default async function transferAllAxies(taskArgs: {
  address: string
  axies: string
}, hre: HardhatRuntimeEnvironment) {

  if (hre.network.name != 'ronin' && hre.network.name != 'saigon') {
    throw new Error('Network not supported')
  }
  const network: AvailableNetworks = hre.network.name

  try {
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    const address = signer.address.toLowerCase()

    let axies = taskArgs.axies ? taskArgs.axies.split(',').map((axie: string) => {
      // remove whitespaces and # and convert to int
      return axie.replace(/\s/g, '').replace('#', '')
    }) : []
    if (axies.length == 0) {
      // get all axies ids from the account
      const axieABI = JSON.parse(await fs.readFile(CONTRACT_AXIE_ABI_JSON_PATH, 'utf8'))
      const axieContract = await new hre.ethers.Contract(CONTRACT_AXIE_ADDRESS[network], axieABI, signer)
      const balance = await axieContract.balanceOf(address)
      for (let i = 0; i < balance; i++) {
        const axieId = await axieContract.tokenOfOwnerByIndex(address, i)
        axies.push(ethers.BigNumber.from(axieId).toString())
      }
    }

    console.log(`Transferring ${axies.length} axies from ${address} to ${taskArgs.address}`)

    // Get batch transfer contract
    const batchTransferABI = JSON.parse(await fs.readFile(CONTRACT_ERC721_BATCH_TRANSFER_ABI_JSON_PATH, 'utf8'))
    const batchTransferContract = await new hre.ethers.Contract(CONTRACT_ERC721_BATCH_TRANSFER_ADDRESS[network], batchTransferABI, signer)

    // Get Axie contract
    const axieABI = JSON.parse(await fs.readFile(CONTRACT_AXIE_ABI_JSON_PATH, 'utf8'))
    const axieContract = await new hre.ethers.Contract(CONTRACT_AXIE_ADDRESS[network], axieABI, signer)

    // Check if the contract is approved
    const isApproved = await axieContract.isApprovedForAll(address, CONTRACT_ERC721_BATCH_TRANSFER_ADDRESS[network])

    // Requirements: msg.sender has to call setApprovalForAll on _tokenContract to authorize this contract.
    if (!isApproved) {
      console.log('Approving Batch Transfer contract')
      const tx = await axieContract.setApprovalForAll(CONTRACT_ERC721_BATCH_TRANSFER_ADDRESS[network], true)
      // wait for tx to be mined and get receipt
      const receipt = await tx.wait()
      console.log('Receipt:', receipt.transactionHash)
    } else {
      console.log('Batch Transfer contract already approved')
    }

    // Batch Transfer
    const tx = await batchTransferContract.functions['safeBatchTransfer(address,uint256[],address)'](axieContract.address, axies, taskArgs.address.replace('ronin:', '0x').toLowerCase())
    // wait for tx to be mined and get receipt
    const receipt = await tx.wait()
    console.log('Receipt:', receipt.transactionHash)
    return receipt.transactionHash
  } catch (error) {
    console.error(error)
  }
  return false
}
