# Example: Batch Transfer JS

Copy the `.env.example` file to `.env` and fill in your account private key (you can get this from the Ronin wallet) and yout SkyMavis API Key (get from <https://developers.skymavis.com/console/applications/>). Please not share your private key with anyone.

## Install dependencies

```bash
npm install
```

### Run the script

```bash
node sale.js $AXIE_ID // this will create a sale for the $AXIE_ID  for 0.1 ETH
node auction.js $AXIE_ID // this will create a auction for the $AXIE_ID  for 0.1 ETH to 0.5 ETH with a duration of 24 hours
node cancel.js $AXIE_ID // this will cancel the sale/auction for the $AXIE_ID
```

Remplace `$AXIE_ID` with your Ronin wallet address.
