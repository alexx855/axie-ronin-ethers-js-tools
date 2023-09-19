import { buyMarketplaceOrder, getWETHContract } from "axie-ronin-ethers-js-tools";
import { ethers } from 'ethers';
import * as dotenv from 'dotenv'

dotenv.config()

async function buyAxie() {

  if (!process.env.PRIVATE_KEY || !process.env.SKIMAVIS_DAPP_KEY) {
    throw new Error('Please set your PRIVATE_KEY and SKIMAVIS_DAPP_KEY in a .env file')
  }

  // see https://docs.skymavis.com/api/rpc
  const connection = {
    url: 'https://api-gateway.skymavis.com/rpc',
    headers: {
      'x-api-key': process.env.SKIMAVIS_DAPP_KEY
    }
  }

  const provider = new ethers.providers.JsonRpcProvider(connection);

  // Import the wallet private key from the environment
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)

  const address = await wallet.getAddress()
  console.log(`Wallet address: ${address}`)

  // get RON balance
  const balance = await provider.getBalance(address)
  const balanceInEther = ethers.utils.formatEther(balance)
  console.log(`Balance: ${balanceInEther} RON`)

  // get WETH balance
  const wethContract = await getWETHContract(provider)
  const wethBalance = await wethContract.balanceOf(address)
  const wethBalanceInEther = ethers.utils.formatEther(wethBalance)
  console.log(`WETH Balance: ${wethBalanceInEther} WETH`)

  // get axie id from  command line args
  const args = process.argv.slice(2)
  const axieId = parseInt(args[0])

  const skyMavisApiKey = process.env.SKIMAVIS_DAPP_KEY
  const receipt = await buyMarketplaceOrder(axieId, wallet, provider, skyMavisApiKey)
  console.log(receipt.transactionHash)
}

buyAxie()