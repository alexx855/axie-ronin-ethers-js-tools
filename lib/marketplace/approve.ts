import { ethers } from "ethers";
import { MARKETPLACE_GATEWAY_V2 } from "@roninbuilders/contracts";
import { getAxieContract } from "../contracts";

// check and approve the axie contract to transfer axies from address to the marketplace contract
export default async function approveMarketplaceContract(address: string, signer: ethers.Signer) {
  const axieContract = await getAxieContract(signer)
  let isApproved = await axieContract.isApprovedForAll(address, MARKETPLACE_GATEWAY_V2.address)

  if (!isApproved) {
    console.log('Approving marketplace contract')
    const tx = await axieContract.setApprovalForAll(MARKETPLACE_GATEWAY_V2.address, true)
    // wait for tx to be mined and get receipt
    const receipt = await tx.wait()
    console.log('Receipt:', receipt.transactionHash)
    // check if marketplace contract is approved for the axie contract
    isApproved = await axieContract.isApprovedForAll(address, MARKETPLACE_GATEWAY_V2.address)
  } 

  return isApproved
}
