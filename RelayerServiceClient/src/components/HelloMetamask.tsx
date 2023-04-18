import { useEffect, useState, useRef, CSSProperties } from "react";
import { useMetamask, ConnectMetamask, loadSmartContract } from "../metamask";
import dapp from "../metamask/dapp";
import { Dropdown, DropdownButton, ButtonGroup, InputGroup, Form, Button, Modal} from 'react-bootstrap';
import { toast } from 'react-toastify';
import CircleLoader from "react-spinners/ClipLoader";
import { targetTokenOne, targetTokenTwo, targetTokenThree, receiverForwarder, baseUri, explorerUrl} from "../config/constants";
import { getTokenBalance, getMetaTxSign } from "../utils/intex";
import axios from 'axios';
import Web3 from "web3";
import BigNumber from "bignumber.js";
import { truncate } from 'lodash';




export default function HelloMetamask() {
  const [selectedToken, setSelectedToken] = useState<string>(null);
  const [tokenDetails, setTokenDetails] = useState<TokenDetails>({symbol:"N/A",balance: 0});
  const [show, setShow] = useState(false);
  const [inputRef, setInputRef] = useState<any>("");
  const { user } = useMetamask();
  let recipientRef = useRef<string>(null);
  let hashRef = useRef<string>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => { 
    (async() => {
      if(selectedToken != null) {
        const result: any = await getTokenBalance(selectedToken,user.address);
        
        setTokenDetails({
          symbol: result.symbol,
          balance: result.balance
        });
      } 
    })();
  }, [selectedToken]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const getTokenName = (args: any)  => {
    if(args == targetTokenOne) {
      return "TARGET TONE"
    } else if(args == targetTokenTwo) {
      return "TARGET TTWO"
    } else if(args == targetTokenThree) {
      return "TARGET TTHREE"
    } else {
      return "SELECT TOKEN"
    }
  }

  const getInput = (event: any) => {
    const regex = /^[1-9]\d*$/;
    if (regex.test(event.target.value)) {
        setInputRef(event.target.value);
    }  
  }  
  
  const getReceipt = (event: any) => {
    recipientRef.current = event.target.value;
  }

  const errorToast = (msg: string) => {
    toast.error(msg, {
      position: toast.POSITION.TOP_RIGHT
     });
  }

  const execute = async() => {
    let errMsg : string;
    errMsg = recipientRef.current == null ? "Receipt Address is Invalid !" : null;
    if (errMsg != null) {
      errorToast(errMsg) 
      return;
    };
    errMsg = inputRef == 0 ? "Please enter the token amount !" : null;
    if (errMsg != null) {
      errorToast(errMsg) 
      return;
    };
    errMsg = selectedToken == null  ? "Select the target token !" : null;
    if (errMsg != null) {
      errorToast(errMsg) 
      return;
    };
    errMsg = tokenDetails.balance == 0 || user.balance == 0 ? "Need Sufficient Balance !" : null;
    if (errMsg != null) {
      errorToast(errMsg) 
      return;
    };
    errMsg = tokenDetails.balance < (inputRef * 1e18) ? "Wallet Balance Is Low !" : null;
    if (errMsg != null) {
      errorToast(errMsg) 
      return;
    };

    onMetaTx().then(async(result: ForwardRequest) => {
        if(result.signature != null) {
          handleShow();
          makeTransaction(result).then((response: any) => {
            console.log("response", response);
            
            if(response.status == 200) {
              hashRef.current = response.hash;
              setLoadingStatus(false);
              toast.success("Transaction Executed !", {
                position: toast.POSITION.TOP_RIGHT
              });
            } else {
              setLoadingStatus(false);
              toast.success(response.message, {
                position: toast.POSITION.TOP_RIGHT
              });
            }
          });

          
          // toast.success("Transaction Executed !", {
          //   position: toast.POSITION.TOP_RIGHT
          // });

          // setInterval(() => {
          //   console.log('This will be called every 2 seconds');
          // }, 2000);        
        }          
    }); 

    // handleShow();
    // toast.success("Transaction Executed !", {
    //   position: toast.POSITION.TOP_RIGHT
    // });

    // const hash: string = "0x317360ac9d63c71402048b489c7b5a2516c976f77abacef19217d371c3e22e28";

    // const interval = setInterval(() => {
    //   hashRef.current = hash;
    //   setLoadingStatus(false);
    //   console.log('This will be called every 2 seconds');
    //   console.log("hash print", `${explorerUrl}${hashRef.current}`  );
      
    // }, 2000);
    // return () => clearInterval(interval);
  }

  const makeTransaction = async(args: ForwardRequest): Promise<{status: number,message: string,hash: string}> => {
    var metadataConfig = {
      method: 'post',
      url: `${baseUri}/metatx`,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*'
      },
      data : args
    };    
    const metadataRes = await axios(metadataConfig);
    console.log("metadataRes", metadataRes.data);

    const status = metadataRes.data.status;
    const message = metadataRes.data.message;
    const hash = metadataRes.data.transactionHash;

    return {status,message,hash}
  }

  const setValue = async() => {
    setInputRef(1);
    setSelectedToken(targetTokenTwo);   
    recipientRef.current = "0x041aB2c3e09423C954CCE80cECE5143120E33729";
  }

  const onMetaTx = async(): Promise<ForwardRequest> => {
    const currentWeb3: any = new Web3(window.ethereum);
    const userAccount = user.address;

    const amount = new BigNumber(inputRef * 1e18);
    const chainId = await currentWeb3.eth.getChainId();
    const currentBlockNumber = Number(await currentWeb3.eth.getBlockNumber()) + 50;    

    return new Promise((resolve, reject) => {       
      getMetaTxSign(receiverForwarder,user.address,recipientRef.current,amount).then((metaTxValue) => {
        const msgParams = {
          types: {
              EIP712Domain:  [
                  {name: "name", type: "string"},
                  {name: "version", type: "string"},
                  {name: "chainId", type: "uint256"},
                  {name: "verifyingContract", type: "address"}
              ],
              ReceiverRequest: [
                  { name: 'from', type: 'address' },
                  { name: 'target', type: 'address' },
                  { name: 'tokenAmount', type: 'uint256' },
                  { name: 'nonce', type: 'uint256' },
                  { name: 'expireTime', type: 'uint256' },
                  { name: 'data', type: 'bytes' }
              ]
          },
          domain: {
              name: 'ReceiverForwarder',
              version: 'V.0.1',
              chainId: chainId,
              verifyingContract: receiverForwarder
          },
          primaryType: "ReceiverRequest",
          message: {
            from: userAccount,
            target: selectedToken,
            tokenAmount: amount.toString(),
            nonce: metaTxValue.nonce,
            expireTime: currentBlockNumber,
            data: metaTxValue.calldata
          },
        }; 
        const typedData = JSON.stringify(msgParams);  
        currentWeb3.currentProvider.sendAsync({
              method: 'eth_signTypedData_v3',
              params: [userAccount,typedData],
              from: userAccount,
          }, function (err: any, result: any) {
              if (err || result.error) {
                reject(err)
              }
              const signature = result.result.substring(2);

              let forwardRequest: ForwardRequest = {
                caller : userAccount,
                targetToken : selectedToken,
                tokenAmount : Number(amount),
                nonce : metaTxValue.nonce,
                callData : metaTxValue.calldata,
                expireTime : currentBlockNumber,
                signature : result.result.toString(),
              }

             // console.log("before forwardRequest", forwardRequest);

              // console.log("signature", result.result);
              resolve(forwardRequest);              
        });
      })
    })
  } 

  const handleClick = (event: any) => {
    event.preventDefault();
    window.open(`${explorerUrl}${hashRef.current}`, '_blank');
  };

  // const apiCheck = async() => {
    
  //   var metadataConfig = {
  //     method: 'get',
  //     url: `${baseUri}/health-check`,
  //     headers: { 
  //       'Content-Type': 'application/json', 
  //       'Access-Control-Allow-Origin': '*'
  //     }
  //   };
    
  //   const metadataRes = await axios(metadataConfig);
  //   console.log("metadataRes", metadataRes.data);
    

  //   // const privatekey = "Hello";
  //   // const secertkey = "knfkjwhfewf";
    

  //   // const data = {
  //   //   privatekey: privatekey,
  //   //   secertkey : secertkey
  //   // }
  //   // var metadataConfig = {
  //   //   method: 'post',
  //   //   url: `${baseUri}/encryptPrivateKey`,
  //   //   headers: { 
  //   //     'Accept': 'application/json', 
  //   //     "Access-Control-Allow-Origin": '*',
  //   //   //   'Authorization':`Bearer ${process.env.PINATA_JWT}`, 
  //   //   //  // ...data.getHeaders()
  //   //   },
  //   //   data : data
  //   // };
    
  //   // // console.log("before execute", args);
    
  //   // const metadataRes = await axios(metadataConfig);
  //   // console.log("metadataRes", metadataRes.data);
  // }


  return (
    <div className="flex flex-col items-center bg-slate-100 h-screen justify-center">
      <div className="shadow-lg text-center border border-slate-300 bg-white p-10 rounded-md">
        {
          user.isConnected == false ? 
          (
            <ConnectMetamask />
          ) : 
          user.isConnected == true ?
          (
            <>
              <div className="my-3 uppercase text-sm tracking-widest font-light">
                Wallet connected
              </div>
              <div className="my-3 tracking-widest font-extrabold">
                {user.address}
              </div>
              <div className="my-3 uppercase tracking-wide text-xs">
                Balance: {user.balance.toString().slice(0, 10)} ETH
              </div>
              <div className="my-3 uppercase tracking-wide text-xs">
                Token Balance: {(tokenDetails.balance/1e18).toString().slice(0, 10)} {tokenDetails.symbol}
              </div>
            <div>
            <InputGroup className="mb-3">
                
                <Form.Control
                  aria-label="Default"
                  aria-describedby="inputGroup-sizing-default"
                  placeholder="Wallet Address"
                  onChange={getReceipt}
                />
                <InputGroup.Text id="inputGroup-sizing-default">
                Recipient
                </InputGroup.Text>
            </InputGroup>
                <InputGroup className="mb-3">
                  <Form.Control 
                    required
                    aria-label="Text input with dropdown button"
                    placeholder="Token Amount"
                    onChange={getInput}
                    type="number"
                    value={inputRef}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid city.
                  </Form.Control.Feedback>

                  <DropdownButton
                    variant="outline-secondary"
                    title={getTokenName(selectedToken)}
                    id="input-group-dropdown-2"
                    align="end"
                    onSelect={setSelectedToken}
                  >
                    <Dropdown.Item eventKey={targetTokenOne}>TARGET TOKEN ONE  </Dropdown.Item>
                    <Dropdown.Item eventKey={targetTokenTwo}>TARGET TOKEN TWO  </Dropdown.Item>
                    <Dropdown.Item eventKey={targetTokenThree}>TARGET TOKEN THREE</Dropdown.Item>
                  </DropdownButton>
                </InputGroup>
                <Button type="submit" onClick={execute}>Submit form</Button>
             </div>
            </>
          ) : 
          (
            <>
              <div className="my-3 uppercase text-sm tracking-widest font-light">
                Wallet Not Detected
              </div>
              <div className="my-3 tracking-widest font-extrabold">
                Please Install Metamask
              </div>
            </>
          )
        }
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Transaction Hash</Modal.Title>
        </Modal.Header>
        {
          loadingStatus ? 
            <Modal.Body>
              <div className="flex items-center justify-center">
                <CircleLoader color="#36D7B7" loading={true} size={105} />
              </div>
            </Modal.Body>
        :
        <Modal.Body> 
          <div className="font-extrabold flex items-center justify-center">
              {/* Hash {truncate(hashRef.current, { length: 12 })}  */}
              <a href="#" onClick={handleClick} className="link-to-show"> Hash - {truncate(hashRef.current, { length: 34 })}</a>
          </div>
         
        </Modal.Body>
        }
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>  
      </Modal>
    </div>
  );
}
