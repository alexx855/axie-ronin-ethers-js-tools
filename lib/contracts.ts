import { ethers } from "ethers";
import { SignerOrProvider } from "./utils";
import { type AvailableNetworks } from "./constants";
import { AXIE_PROXY, ERC721_BATCH_TRANSFER, MARKETPLACE_GATEWAY_V2, USD_COIN, WRAPPED_ETHER } from "@roninbuilders/contracts";


export async function getAxieContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const address = AXIE_PROXY.address
  const abi = new ethers.utils.Interface(AXIE_PROXY.abi);
  const axieContract = new ethers.Contract(
    address,
    abi,
    signerOrProvider
  )
  return axieContract
}

export async function getMarketplaceContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const address =  MARKETPLACE_GATEWAY_V2.address
  const abi = new ethers.utils.Interface(MARKETPLACE_GATEWAY_V2.abi);
  const marketplaceContract = new ethers.Contract(
    address,
    abi,
    signerOrProvider
  )
  return marketplaceContract
}

export async function getBatchTransferContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const address =  ERC721_BATCH_TRANSFER.address
  const abi = new ethers.utils.Interface(ERC721_BATCH_TRANSFER.abi);
  const batchTransferContract = new ethers.Contract(
    address,
    abi,
    signerOrProvider
  )
  return batchTransferContract
}

export async function getWETHContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const address = WRAPPED_ETHER.address
  const abi = new ethers.utils.Interface(WRAPPED_ETHER.abi);
  const wethContract = new ethers.Contract(
    address,
    abi,
    signerOrProvider
  )
  return wethContract
}

export async function getUSDCContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const address =  USD_COIN.address
  // @ts-expect-error wrong USD_COIN.abi??
  const abi = new ethers.utils.Interface(USD_COIN.abi);
  const usdcContract = new ethers.Contract(
    address,
    abi,
    signerOrProvider
  )
  return usdcContract
}
