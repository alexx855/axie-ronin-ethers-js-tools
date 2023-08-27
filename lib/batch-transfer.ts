import { ethers } from "ethers";
import { getAxieContract, getBatchTransferContract } from "./contracts";

export default async function batchTransferAxies(
  addressFrom: string,
  addressTo: string,
  axieIds: string[],
  Signer: ethers.Signer
) {
  console.log(`Transferring ${axieIds.length} axies from ${addressFrom} to ${addressTo}`)

  // check if the batch contract is approved to transfer the axies from addressFrom
  const batchTransferContract = await getBatchTransferContract(Signer)
  const axieContract = await getAxieContract(Signer)
  const isApproved = await axieContract.isApprovedForAll(addressFrom, batchTransferContract.address)

  // requirements: msg.sender has to call setApprovalForAll on _tokenContract to authorize this contract.
  if (!isApproved) {
    console.log('Approving Batch Transfer contract')
    const tx = await axieContract.setApprovalForAll(batchTransferContract.address, true)
    // wait for tx to be mined and get receipt
    const receipt = await tx.wait()
    console.log('Receipt:', receipt.transactionHash)
  } else {
    console.log('Batch Transfer contract already approved')
  }

  // batch Transfer
  const tx = await batchTransferContract.functions['safeBatchTransfer(address,uint256[],address)'](axieContract.address, axieIds, addressTo.replace('ronin:', '0x').toLowerCase())
  // wait for tx to be mined and get receipt  
  const receipt = await tx.wait()
  return receipt
}