import { ethers } from "ethers";
import { SignerOrProvider } from "./utils";
import { type AvailableNetworks } from "./constants";
import {
  AXIE_ADDRESS, AXIE_ADDRESS_SAIGON, AXIE_ABI,
  MARKETPLACE_ADDRESS, MARKETPLACE_ADDRESS_SAIGON, MARKETPLACE_ABI,
  ERC721_BATCH_TRANSFER_ADDRESS,
  ERC721_BATCH_TRANSFER_ADDRESS_SAIGON,
  ERC721_BATCH_TRANSFER_ABI,
  WETH_ABI, WETH_ADDRESS, WETH_ADDRESS_SAIGON,
  USDC_ADDRESS, USDC_ADDRESS_SAIGON, USDC_ABI,
} from "@roninbuilders/contracts";

export async function getAxieContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const address = network === 'ronin' ? AXIE_ADDRESS : AXIE_ADDRESS_SAIGON
  const abi = new ethers.utils.Interface(JSON.stringify(AXIE_ABI));
  const axieContract = new ethers.Contract(
    address,
    abi,
    signerOrProvider
  )
  return axieContract
}

export async function getMarketplaceContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const address = network === 'ronin' ? MARKETPLACE_ADDRESS : MARKETPLACE_ADDRESS_SAIGON
  const abi = new ethers.utils.Interface(JSON.stringify(MARKETPLACE_ABI));
  const marketplaceContract = new ethers.Contract(
    address,
    abi,
    signerOrProvider
  )
  return marketplaceContract
}

export async function getBatchTransferContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const address = network === 'ronin' ? ERC721_BATCH_TRANSFER_ADDRESS : ERC721_BATCH_TRANSFER_ADDRESS_SAIGON
  const abi = new ethers.utils.Interface(JSON.stringify(ERC721_BATCH_TRANSFER_ABI));
  const batchTransferContract = new ethers.Contract(
    address,
    abi,
    signerOrProvider
  )
  return batchTransferContract
}

export async function getWETHContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const address = network === 'ronin' ? WETH_ADDRESS : WETH_ADDRESS_SAIGON
  const abi = new ethers.utils.Interface(JSON.stringify(WETH_ABI));
  const wethContract = new ethers.Contract(
    address,
    abi,
    signerOrProvider
  )
  return wethContract
}

export async function getUSDCContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const address = network === 'ronin' ? USDC_ADDRESS : USDC_ADDRESS_SAIGON
  const abi = new ethers.utils.Interface(JSON.stringify(USDC_ABI));
  const usdcContract = new ethers.Contract(
    address,
    abi,
    signerOrProvider
  )
  return usdcContract
}
