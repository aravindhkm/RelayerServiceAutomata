# ReceiverForwarderContract
Receiver smart contract can parse the meta-transaction and handle the user
transaction within it

### Install

```sh
git clone https://github.com/aravindhkm/RelayerServiceAutomata.git
cd RelayerServiceAutomata
npm install --save

# Contract Compile
npx hardhat compile

# Contract Test
npx hardhat test

# Contract Deploy
npx hardhat run scripts/deploy.ts --network testnet
```

### Using Local Environment


```bash
# Copy Example Env file
cp ./env.example .env

# RPC URL of the MainNet
MAINNET_URL=""
# RPC URL of the TestNet
TESTNET_URL=""
# Deployer Wallet Private Key
PRIVATE_KEY=""
# Chain EndPoint ApiKey. Here we used for contract verfication
ETHERSCAN_API_KEY=""

```



