import { ethers } from "ethers";
import { getAxieContract, getBatchTransferContract } from "./contracts";

export default async function batchTransferAxies(
  signer: ethers.Signer,
  addressTo: string,
  axieIds: Array<string | number>
) {
  const addressFrom = await signer.getAddress()
  console.log(`Transferring ${axieIds.length} axies from ${addressFrom} to ${addressTo}`)

  // convert axieIds to an array of strings
  const axies: string[] = axieIds.map((axieId) => {
    return typeof axieId === 'string' ? axieId : axieId.toString()
  })

  // check if the batch contract is approved to transfer the axies from addressFrom
  const writeBatchTransferContract = await getBatchTransferContract(signer)
  const writeAxieContract = await getAxieContract(signer)
  const isApproved = await writeAxieContract.isApprovedForAll(addressFrom, writeBatchTransferContract.address)

  // requirements: msg.sender has to call setApprovalForAll on _tokenContract to authorize this contract.
  if (!isApproved) {
    console.log('Approving Batch Transfer contract')
    const tx = await writeAxieContract.setApprovalForAll(writeBatchTransferContract.address, true)
    // wait for tx to be mined and get receipt
    const receipt = await tx.wait()
    console.log('Receipt:', receipt.transactionHash)
  } else {
    console.log('Batch Transfer contract already approved')
  }

  // batch Transfer, call the function this way since it's overloaded
  const tx = await writeBatchTransferContract.functions['safeBatchTransfer(address,uint256[],address)'](writeAxieContract.address, axies, addressTo.replace('ronin:', '0x').toLowerCase())
  // wait for tx to be mined and get receipt  
  const receipt = await tx.wait()
  return receipt
}