import * as web3 from "@solana/web3.js";
import nacl from "tweetnacl";
import { SIGNER_KEYPAIR, SIGNER_WALLET, SIGNER_PK, USER_KEYPAIR, USER_WALLET, USER_PK } from './utils/constant';

async function print(){
    let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
    
    let slot = await connection.getSlot();
    console.log(slot);
    // 93186439
    
    let blockTime = await connection.getBlockTime(slot);
    console.log(blockTime);
    // 1630747045
}

async function airdrop(){
    // 使用导入的常量替换本地密钥对读取
    let payer = SIGNER_KEYPAIR;

    console.log(SIGNER_PK.toBase58());
    console.log(SIGNER_KEYPAIR.publicKey.toBase58());
    console.log(USER_PK.toBase58());
    console.log(USER_KEYPAIR.publicKey.toBase58());

    let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
    
    // 获取最小租金金额
    const minRent = await connection.getMinimumBalanceForRentExemption(0);
    console.log(minRent);
    
    // Create Simple Transaction
    let transaction = new web3.Transaction();
    
    // Add an instruction to execute
    transaction.add(
    web3.SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: USER_PK,
        lamports: minRent, // 使用最小租金金额
    }),
    );
    
    // Send and confirm transaction
    // Note: feePayer is by default the first signer, or payer, if the parameter is not set
    await web3.sendAndConfirmTransaction(connection, transaction, [payer]);
    
    // Alternatively, manually construct the transaction
    let recentBlockhash = await connection.getLatestBlockhash();
    let manualTransaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: USER_PK,
            lamports: minRent,
        })
    );
    manualTransaction.recentBlockhash = recentBlockhash.blockhash;
    manualTransaction.feePayer = payer.publicKey;
    
    let transactionBuffer = manualTransaction.serializeMessage();
    let signature = nacl.sign.detached(transactionBuffer, payer.secretKey);
        
    manualTransaction.addSignature(payer.publicKey, Buffer.from(signature));
    
    let isVerifiedSignature = manualTransaction.verifySignatures();
    console.log(`The signatures were verified: ${isVerifiedSignature}`);
    
    // The signatures were verified: true
    
    let rawTransaction = manualTransaction.serialize();
    
    await web3.sendAndConfirmRawTransaction(connection, rawTransaction);
}

// print();
airdrop();
