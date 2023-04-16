import web3 from "web3";
import { url, forwardRequest, privateKey ,receiverForwarderContract, receiverForwarderAbi } from "../config/intex";

const currentWeb3: web3 = new web3(new web3.providers.HttpProvider(String(url)));
const receiverInstance = new currentWeb3.eth.Contract(receiverForwarderAbi,receiverForwarderContract);

export const makeTransaction = async(forwardRequest: forwardRequest,signature: string): Promise<string> => {
    const {address} = await currentWeb3.eth.accounts.wallet.add(String(privateKey));  
    const calldata  = await receiverInstance.methods.execute(forwardRequest, signature).encodeABI();
    const estimateGas = await receiverInstance.methods.execute(forwardRequest, signature).estimateGas({from:address});
    const gasPrice = await currentWeb3.eth.getGasPrice(); 
    const tx_data = {
        from: address,
        to: receiverForwarderContract,
        gas: estimateGas,
        gasPrice: gasPrice, 
        data: calldata
    }

    const receipt = await currentWeb3.eth.sendTransaction(tx_data);
    return `https://testnet.bscscan.com/tx/${receipt.transactionHash}`; 
}

export const verifyMetaTx =async (forwardRequest: forwardRequest,signature: string): Promise<Boolean> => { 
    try {
        return await receiverInstance.methods.verify(forwardRequest, signature).call();
    } catch {
        return false;
    }   
}
