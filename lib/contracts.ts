import * as fs from 'fs/promises'
import { ethers } from "ethers";
import { SignerOrProvider } from "./utils";
import {
  AvailableNetworks,
  CONTRACT_AXIE_ABI_JSON_PATH,
  CONTRACT_AXIE_ADDRESS,
  CONTRACT_ERC721_BATCH_TRANSFER_ABI_JSON_PATH,
  CONTRACT_ERC721_BATCH_TRANSFER_ADDRESS,
  CONTRACT_MARKETPLACE_V2_ABI_JSON_PATH,
  CONTRACT_MARKETPLACE_V2_ADDRESS,
  CONTRACT_USDC_ABI_JSON_PATH,
  CONTRACT_USDC_ADDRESS,
  CONTRACT_WETH_ABI_JSON_PATH,
  CONTRACT_WETH_ADDRESS
} from "./constants";

export async function getAxieContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const axieABI = JSON.parse(await fs.readFile(CONTRACT_AXIE_ABI_JSON_PATH, 'utf8'))
  const axieContract = await new ethers.Contract(
    CONTRACT_AXIE_ADDRESS[network],
    axieABI,
    signerOrProvider
  )
  return axieContract
}

export async function getMarketplaceContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const marketAbi = JSON.parse(await fs.readFile(CONTRACT_MARKETPLACE_V2_ABI_JSON_PATH, 'utf8'))
  const marketplaceContract = await new ethers.Contract(
    CONTRACT_MARKETPLACE_V2_ADDRESS[network],
    marketAbi,
    signerOrProvider
  )
  return marketplaceContract
}

export async function getBatchTransferContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const batchTransferABI = JSON.parse(await fs.readFile(CONTRACT_ERC721_BATCH_TRANSFER_ABI_JSON_PATH, 'utf8'))
  const batchTransferContract = await new ethers.Contract(
    CONTRACT_ERC721_BATCH_TRANSFER_ADDRESS[network],
    batchTransferABI,
    signerOrProvider
  )
  return batchTransferContract
}

export async function getWETHContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const wethABI = JSON.parse(await fs.readFile(CONTRACT_WETH_ABI_JSON_PATH, 'utf8'))
  const wethContract = new ethers.Contract(
    CONTRACT_WETH_ADDRESS[network],
    wethABI,
    signerOrProvider
  )
  return wethContract
}

export async function getUSDCContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const usdcABI = JSON.parse(await fs.readFile(CONTRACT_USDC_ABI_JSON_PATH, 'utf8'))
  const usdcContract = new ethers.Contract(
    CONTRACT_USDC_ADDRESS[network],
    usdcABI,
    signerOrProvider
  )
  return usdcContract
}
