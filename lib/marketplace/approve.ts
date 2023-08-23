import { CONTRACT_MARKETPLACE_V2_ADDRESS } from "../constants";
import { getAxieContract } from "../contracts";
import { SignerOrProvider } from "../utils";

// check and approve the axie contract to transfer axies from address to the marketplace contract
export default async function approveMarketplaceContract(address: string, signerOrProvider: SignerOrProvider) {
  const axieContract = await getAxieContract(signerOrProvider)
  let isApproved = await axieContract.isApprovedForAll(address, CONTRACT_MARKETPLACE_V2_ADDRESS['ronin'])

  if (!isApproved) {
    console.log('Approving marketplace contract')
    const tx = await axieContract.setApprovalForAll(CONTRACT_MARKETPLACE_V2_ADDRESS['ronin'], true)
    // wait for tx to be mined and get receipt
    const receipt = await tx.wait()
    console.log('Receipt:', receipt.transactionHash)
    // check if marketplace contract is approved for the axie contract
    isApproved = await axieContract.isApprovedForAll(address, CONTRACT_MARKETPLACE_V2_ADDRESS['ronin'])
  }

  return isApproved
}
