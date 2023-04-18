# RelayerServiceServer
Relayer service server can make the transaction.Who make the request based on EIP712 request in client side. Their transaction will execute in the contract based on the standard EIP2771.

Please visit the Meta Transactions [https://eips.ethereum.org/EIPS/eip-2771](https://eips.ethereum.org/EIPS/eip-2771)

### Using Local Environment

```bash
# Copy Example Env file
cp ./env.example .env

# Port number
PORT=""
# RPC URL of the TestNet
ENCRYPTEDPRIVATEKEY=""
# Deployer Wallet Private Key
RPCURL=""
# Chain EndPoint ApiKey. Here we used for contract verfication
ETHERSCAN_API_KEY=""

```


### Install

```sh
git clone https://github.com/aravindhkm/RelayerServiceAutomata.git
cd RelayerServiceServer
npm install --save
npm run start
```

### API Endpoints

List of available routes:

**Auth routes**:\
`POST /v1/auth/register` - register\
`POST /v1/auth/login` - login\
`POST /v1/auth/refresh-tokens` - refresh auth tokens\
`POST /v1/auth/forgot-password` - send reset password email\
`POST /v1/auth/reset-password` - reset password\
`POST /v1/auth/send-verification-email` - send verification email\
`POST /v1/auth/verify-email` - verify email

**User routes**:\
`POST /v1/users` - create a user\
`GET /v1/users` - get all users\
`GET /v1/users/:userId` - get user\
`PATCH /v1/users/:userId` - update user\
`DELETE /v1/users/:userId` - delete user
