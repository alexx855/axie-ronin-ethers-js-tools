import { ethers } from 'ethers';
import { getAxieIdsFromAccount,  batchTransferAxies } from "axie-ronin-ethers-js-tools";
import 'dotenv/config'

async function batchTransfer(){

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
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

  const addressFrom = await wallet.getAddress()
  console.log(`Wallet address: ${addressFrom}`)

  // Get RON balance
  const balance = await provider.getBalance(addressFrom)
  const balanceInRON = ethers.utils.formatEther(balance)
  console.log(`Balance: ${balanceInRON} RON`)

  if (balanceInRON < 0.001) {
    throw new Error('Not enough RON to pay for the transaction')
  }

  // Get addressTo from command line args
  const args = process.argv.slice(2)
  const address = args[0]
  const addressTo = address ? address.replace('ronin:', '0x') : false
  if (!addressTo || !ethers.utils.isAddress(addressTo)) {
    throw new Error('Please provide a valid address as the first argument')
  }

  console.log(`Transfering to: ${addressTo}`)

  // Get all axies ids from the account
  const axieIds = await getAxieIdsFromAccount(addressFrom, provider)

  if (axieIds.length === 0) {
    console.log('No axies to transfer')
    return
  }

  // Wait for tx to be mined and get the transaction hash
  const receipt = await batchTransferAxies(wallet, addressTo, axieIds)
  if (!receipt || !receipt.transactionHash) {
    throw new Error('Something went wrong, please try again')
  }

  console.log(`You can check the transaction status on https://app.roninchain.com/tx/${receipt.transactionHash}`)
}

batchTransfer();