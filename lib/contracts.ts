import * as fs from 'fs/promises'
import { ethers } from "ethers";
import { SignerOrProvider } from "./utils";
import {
  type AvailableNetworks,
  CONTRACT_AXIE_ADDRESS,
  CONTRACT_ERC721_BATCH_TRANSFER_ADDRESS,
  CONTRACT_MARKETPLACE_V2_ADDRESS,
  CONTRACT_USDC_ADDRESS,
  CONTRACT_WETH_ADDRESS,
  CONTRACT_AXIE_ABI_JSON_PATH,
  CONTRACT_ERC721_BATCH_TRANSFER_ABI_JSON_PATH,
  CONTRACT_MARKETPLACE_V2_ABI_JSON_PATH,
  CONTRACT_USDC_ABI_JSON_PATH,
  CONTRACT_WETH_ABI_JSON_PATH
} from "./constants";

export async function getAxieContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const CONTRACT_AXIE_ABI = JSON.parse(await fs.readFile(__dirname + CONTRACT_AXIE_ABI_JSON_PATH, 'utf8'))
  const axieContract = await new ethers.Contract(
    CONTRACT_AXIE_ADDRESS[network],
    CONTRACT_AXIE_ABI,
    signerOrProvider
  )
  return axieContract
}

export async function getMarketplaceContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const CONTRACT_MARKET_Abi = JSON.parse(await fs.readFile(__dirname + CONTRACT_MARKETPLACE_V2_ABI_JSON_PATH, 'utf8'))
  const marketplaceContract = await new ethers.Contract(
    CONTRACT_MARKETPLACE_V2_ADDRESS[network],
    CONTRACT_MARKET_Abi,
    signerOrProvider
  )
  return marketplaceContract
}

export async function getBatchTransferContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const CONTRACT_BATCHTRANSFER_ABI = JSON.parse(await fs.readFile(__dirname + CONTRACT_ERC721_BATCH_TRANSFER_ABI_JSON_PATH, 'utf8'))
  const batchTransferContract = await new ethers.Contract(
    CONTRACT_ERC721_BATCH_TRANSFER_ADDRESS[network],
    CONTRACT_BATCHTRANSFER_ABI,
    signerOrProvider
  )
  return batchTransferContract
}

export async function getWETHContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const CONTRACT_WETH_ABI = JSON.parse(await fs.readFile(__dirname + CONTRACT_WETH_ABI_JSON_PATH, 'utf8'))
  const wethContract = new ethers.Contract(
    CONTRACT_WETH_ADDRESS[network],
    CONTRACT_WETH_ABI,
    signerOrProvider
  )
  return wethContract
}

export async function getUSDCContract(signerOrProvider?: SignerOrProvider, network: AvailableNetworks = 'ronin') {
  const CONTRACT_USDC_ABI = JSON.parse(await fs.readFile(__dirname + CONTRACT_USDC_ABI_JSON_PATH, 'utf8'))
  const usdcContract = new ethers.Contract(
    CONTRACT_USDC_ADDRESS[network],
    CONTRACT_USDC_ABI,
    signerOrProvider
  )
  return usdcContract
}
