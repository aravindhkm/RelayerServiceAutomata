import { useEffect, useState, useRef, CSSProperties } from "react";
import { useMetamask, ConnectMetamask, loadSmartContract } from "../metamask";
import dapp from "../metamask/dapp";
import { Dropdown, DropdownButton, ButtonGroup, InputGroup, Form, Button, Modal} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import CircleLoader from "react-spinners/ClipLoader";

export default function HelloMetamask() {
  const [selectedToken, setSelectedToken] = useState<string>("0");
  const [show, setShow] = useState(false);
  const [inputRef, setInputRef] = useState<any>(0);

  let targetToken: string;

  const [validated, setValidated] = useState(false);


  const { user, setContract } = useMetamask();
  const setSmartContract = () => {
    setContract(loadSmartContract(dapp.address, dapp.abi));
  };

  useEffect(() => {
    setSmartContract();        
  }, []);


  const handleSubmit = (event: any) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);
    handleShow();
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const getTokenName = (args: any)  => {
    if(args == 1) {
      targetToken = "hello"
      return "TARGET TONE"
    } else if(args == 2) {
      targetToken = "hello"
      return "TARGET TTWO"
    } else if(args == 3) {
      targetToken = "hello"
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

  const execute = async() => {
    if(targetToken == null || inputRef == 0) {
       console.log("invalid");
       handleShow();
      //  toast.error("Please Check the Inputs !", {
      //   position: toast.POSITION.TOP_RIGHT
      //  });

    } else {
      handleShow();
      // toast.success("Transaction Executed !", {
      //   position: toast.POSITION.TOP_RIGHT
      // });
    }
  }


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

            <div>
            {/* <Form noValidate validated={validated} onSubmit={handleSubmit}> */}
                <InputGroup className="mb-3">
                  <Form.Control 
                    required
                    aria-label="Text input with dropdown button"
                    placeholder="Enter Token Amount"
                    defaultValue="0"
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
                    <Dropdown.Item eventKey="1">TARGET TOKEN ONE  </Dropdown.Item>
                    <Dropdown.Item eventKey="2">TARGET TOKEN TWO  </Dropdown.Item>
                    <Dropdown.Item eventKey="3">TARGET TOKEN THREE</Dropdown.Item>
                  </DropdownButton>
                </InputGroup>
                <Button type="submit" onClick={execute}>Submit form</Button>
                {/* </Form> */}
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
        <Modal.Body>
          <div className="flex items-center justify-center">
            <CircleLoader color="#36D7B7" loading={true} size={105} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>  
      </Modal>
      <ToastContainer />
    </div>
  );
}
