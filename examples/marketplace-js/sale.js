import { ethers } from 'ethers';
import {
  getAxieIdsFromAccount,
  approveMarketplaceContract,
  createMarketplaceOrder,
  generateAccessTokenMessage,
  exchangeToken
} from "axie-ronin-ethers-js-tools";
import 'dotenv/config'

const getMarketplaceAccessToken = async (wallet) => {
  // Get address from signer
  const address = await wallet.getAddress()
  // Generate message to sign
  const domain = `example.com`
  const uri = "https:/example.com"
  const statement = `any statement`
  const message = await generateAccessTokenMessage(address, domain, uri, statement)
  // Sign the message
  const signature = await wallet.signMessage(message)
  // Exchange the signature for an access token
  const { accessToken } = await exchangeToken(signature, message)
  return accessToken
}

async function sale() {

  if (!process.env.PRIVATE_KEY || !process.env.SKIMAVIS_DAPP_KEY) {
    throw new Error('Please set your PRIVATE_KEY and SKIMAVIS_DAPP_KEY in a .env file')
  }

  // Connect to Ronin network rpc,  see https://docs.skymavis.com/api/rpc 
  const connection = {
    url: 'https://api-gateway.skymavis.com/rpc',
    headers: {
      'x-api-key': process.env.SKIMAVIS_DAPP_KEY
    }
  }
  const provider = new ethers.providers.JsonRpcProvider(connection);

  // Import the wallet private key from the environment
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

  // Get address from wallet
  const addressFrom = (await wallet.getAddress()).toLowerCase()
  console.log(`Wallet address: ${addressFrom}`)

  // Get RON balance
  const balance = await provider.getBalance(addressFrom)
  const balanceInRON = ethers.utils.formatEther(balance)
  console.log(`Balance: ${balanceInRON} RON`)

  if (balanceInRON < 0.001) {
    throw new Error('Not enough RON to pay for the transaction')
  }

  // Get axieId from command line args
  const args = process.argv.slice(2)
  const axieId = parseInt(args[0], 10)
  if (isNaN(axieId) || axieId < 1) {
    throw new Error('Please provide a valid axieID as the first argument')
  }

  // Check if the axieId is owned by the wallet addressFrom
  const axieIds = await getAxieIdsFromAccount(addressFrom, provider)
  if (axieIds.length === 0 || !axieIds.includes(axieId)) {
    throw new Error(`Axie ${axieId} is not owned by ${addressFrom}`)
  }

  // Check if axie contract is approved in the marketplace contract, if not, approve the axie contract to transfer axies from address to the marketplace contract
  const isApproved = await approveMarketplaceContract(addressFrom, wallet)
  if (!isApproved) {
    console.log(`Axie Contract is not approved in the Marketplace Contract for ${addressFrom}`)
    return false
  }

  // get current block timestamp
  const currentBlock = await provider.getBlock('latest')
  const startedAt = currentBlock.timestamp
  const endedAt = 0 // 0 means no end date, max is 6 months right now
  const basePrice = ethers.utils.parseUnits('0.1', 'ether').toString()
  const endedPrice = '0'

  // ~ 6 months default and max listing duration
  const expiredAt = startedAt + 15634800
  const orderData = {
    address: addressFrom,
    axieId: axieId.toString(), // axieId must be a string here
    basePrice,
    endedPrice,
    startedAt,
    endedAt,
    expiredAt,
  }

  // Get marketplace access token
  const accessToken = await getMarketplaceAccessToken(wallet)

  // Wait for markeplace api result
  const result = await createMarketplaceOrder(orderData, accessToken, wallet, process.env.SKIMAVIS_DAPP_KEY)
  console.log(result)
}

sale();