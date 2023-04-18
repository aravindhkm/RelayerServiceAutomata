const networks: Record<string, any> = {
  sepolia: {
    chainId: `0x${Number(97).toString(16)}`,
    chainName: "Binance Test Network",
    nativeCurrency: {
      name: "BINANCE TEST ETH",
      symbol: "TBNB",
      decimals: 18,
    },
    rpcUrls: ["https://endpoints.omniatech.io/v1/bsc/testnet/public"],
    blockExplorerUrls: ["https://testnet.bscscan.com/"],
  },
};

export default async function changeNetwork(networkName: string) {
  if (!networkName) networkName = "sepolia";

  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        ...networks[networkName],
      },
    ],
  });
}
