# Example: Batch Transfer JS

Copy the `.env.example` file to `.env` and fill in your account private key (you can get this from the Ronin wallet) and yout SkyMavis API Key (get from <https://developers.skymavis.com/console/applications/>). Please not share your private key with anyone.

## Install dependencies

```bash
npm install
```

### Run the script

This will transfer all axies from the wallet to the specified address, it uses the ERC721 Batch Transfer contract: <https://app.roninchain.com/address/0x2368dfed532842db89b470fde9fd584d48d4f644>

```bash
node index.js $RONIN_ADDRESS
```

Remplace `$RONIN_ADDRESS` with your Ronin wallet address.
