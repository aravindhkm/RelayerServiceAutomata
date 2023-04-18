import web3 from "web3";
import {tokenAbi, receiverForwarderAbi, httpProvider} from "../config/constants";

export const getTokenBalance = async(targetToken: string, wallet:string) : Promise<{balance:number, symbol:string}>=> {
    const currentWeb3 = new web3(new web3.providers.HttpProvider(httpProvider));
    const tokenInstance = new currentWeb3.eth.Contract(tokenAbi,targetToken);
    const balance = await tokenInstance.methods.balanceOf(wallet).call();
    const symbol = await tokenInstance.methods.symbol().call();
    return {balance,symbol}
}


export const getMetaTxSign = async(contract: string, fromWallet:string,toWallet:string,amount:number) : Promise<{nonce:number, calldata:string}>=> {
    const currentWeb3 = new web3(new web3.providers.HttpProvider(httpProvider));
    const tokenInstance = new currentWeb3.eth.Contract(tokenAbi);
    const receiverInstance = new currentWeb3.eth.Contract(receiverForwarderAbi,contract);

    const nonce = await receiverInstance.methods.getNonce(fromWallet).call();
    const calldata  = await tokenInstance.methods.transfer(toWallet, amount).encodeABI({from: fromWallet});
    return {nonce,calldata}
}