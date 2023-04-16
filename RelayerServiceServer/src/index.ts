import express from "express";
import bodyParser from 'body-parser';
import cors from "cors";
import CryptoJS from "crypto-js";
import { body, validationResult } from "express-validator";
import { port, forwardRequest } from "./config/intex";
import { verifyMetaTx, makeTransaction } from "./services/intex"
import httpStatus from "http-status";

const app = express();
const router = express.Router();
const baseUri = "/api/v1";

app.use(express.json());
app.use(baseUri, router);
app.use(bodyParser.json());
app.use(cors());

router.get("/health-check", (req, res) => res.send("OK!!!"));

router.get(
  "/encryptPrivateKey",
  [
    body("privatekey")
      .exists()
      .notEmpty()
      .withMessage("privatekey is required"),
    body("secertkey")
      .exists()
      .notEmpty()
      .withMessage("secertkey is required"),
  ],
  (req:any,res:any) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const encryptPrivateKey = CryptoJS.AES.encrypt(req.body.privatekey, req.body.secertkey).toString();

        return res.status(httpStatus.OK).json({
          status: httpStatus.OK,
          message: "SUCCESS",
          encryptPrivateKey: encryptPrivateKey
        });

  }
)
router.post(
    "/metatx", 
    [
      body("caller")
        .exists()
        .notEmpty()
        .withMessage("caller is required"),
      body("targetToken")
        .exists()
        .notEmpty()
        .withMessage("targetToken is required"),
      body("tokenAmount")
        .exists()
        .notEmpty()
        .withMessage("tokenAmount is required"),
      body("nonce")
        .exists()
        .notEmpty()
        .withMessage("nonce is required"),
      body("callData")
        .exists()
        .notEmpty()
        .withMessage("callData is required"),
      body("signature")
        .exists()
        .notEmpty()
        .withMessage("signature is required")
    ],
    (req:any,res:any) => {
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }

          let forwardReq: forwardRequest = {
            from : req.body.caller,
            target : req.body.targetToken,
            tokenAmount : req.body.tokenAmount,
            nonce : req.body.nonce,
            data : req.body.callData,
          }

          verifyMetaTx(forwardReq,req.body.signature).then(async(result) => {              
              if(result) {
                  const hash = await makeTransaction(forwardReq,req.body.signature);

                  return res.status(httpStatus.OK).json({
                    status: httpStatus.OK,
                    message: "SUCCESS",
                    transactionHash: hash
                  });
              } else {
                return res.status(httpStatus.BAD_REQUEST).json({
                  status: httpStatus.BAD_REQUEST,
                  message: "SOMETHING_WRONG"
                });
              }            
          })
        } catch (err: any) {
          console.log(err);
          if (!err.statusCode) {
            err.statusCode = httpStatus.BAD_REQUEST;
          }
          return res.status(err.statusCode).json(err);
        }
    }
)

app.listen(port,() =>{
  console.log(`
  ################################################
      🛡️  Server listening on port: ${port} 🛡️
  ################################################
  `)
}); 

app.use((req, res, next) => {
	const err = new Error("API not found");
	return next(err);
});
