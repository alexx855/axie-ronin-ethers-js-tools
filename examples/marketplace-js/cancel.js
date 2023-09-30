import { ethers } from 'ethers';
import { cancelMarketplaceOrder } from "axie-ronin-ethers-js-tools";
import 'dotenv/config'

async function cancel() {
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
    const addressFrom = await wallet.getAddress()
    console.log(`Wallet address: ${addressFrom}`)

    // Get axieId from command line args
    const args = process.argv.slice(2)
    const axieId = args[0].trim()

    // Wait for the transaction to be mined
    const receipt = await cancelMarketplaceOrder(axieId, wallet, process.env.SKIMAVIS_DAPP_KEY)
    console.log(`You can check the transaction status on https://app.roninchain.com/tx/${receipt.transactionHash}`)
}

cancel();