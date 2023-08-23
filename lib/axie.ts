import { getAxieContract } from "./contracts";
import { SignerOrProvider } from "./utils";

export async function getAxieIdsFromAccount(address: string, signerOrProvider: SignerOrProvider) {
  // get axie contract
  const axieContract = await getAxieContract(signerOrProvider)

  // get axies balance for the address
  const axiesBalance = await axieContract.balanceOf(address)

  // get axie ids
  let axieIds = []
  for (let i = 0; i < axiesBalance; i++) {
    const axieId: number = await axieContract.tokenOfOwnerByIndex(address, i)
    axieIds.push(axieId)
  }

  return axieIds
}