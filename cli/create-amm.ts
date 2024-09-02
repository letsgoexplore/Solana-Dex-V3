// import * as web3 from "@solana/web3.js";
// import nacl from "tweetnacl";
// import { SIGNER_KEYPAIR, SIGNER_WALLET, SIGNER_PK, USER_KEYPAIR, USER_WALLET, USER_PK } from './utils/constant';
// import * as consts from "./utils/constant";


// async function airdrop(){
//     let payer = SIGNER_KEYPAIR;

//     let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
    
//     // 获取最小租金金额
//     const minRent = await connection.getMinimumBalanceForRentExemption(0);
//     console.log(minRent);
    
//     // Create Simple Transaction
//     let transaction = new web3.Transaction();
    
//     let initMarketInstruction = await consts.dexProgram.methods
//         .createAmm({
//           amm: 
//         })
//         .accounts({
//             payer: consts.SIGNER_PK,
//             feeTo: consts.FEE_TO_PK,
//             nxMarketAdmin: consts.NX_MARKET_ADMIN_PK,
//             nxMarket: nx_market_pda,
//             marketAuthority: pdaUtils.market_authority_pda()
//         }).instruction();

//     // Add an instruction to execute
//     transaction.add(
      
//     );
    
//     // Send and confirm transaction
//     // Note: feePayer is by default the first signer, or payer, if the parameter is not set
//     await web3.sendAndConfirmTransaction(connection, transaction, [payer]);
// }

// // print();
// airdrop();
