import * as web3 from "@solana/web3.js";
import * as consts from "./utils/constant";
import * as tokenUtils from "./utils/token_utils";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
    getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";
import { sys } from "typescript";

async function createPool() {
    let payer = consts.SIGNER_KEYPAIR;
    
    // 设置fee (例如0.3% = 30 basis points)
    const fee = 30;

    // 创建交易
    let transaction = new web3.Transaction();

    const poolAccount = web3.PublicKey.findProgramAddressSync(
        [consts.AmmPubkey.toBuffer(), consts.ATokenPubkey.toBuffer(), consts.BTokenPubkey.toBuffer()],
        new web3.PublicKey(process.env.DEX_PROGRAM_ID)
    )[0];

    console.log("poolAccount:", poolAccount);

    const poolAuthority = web3.PublicKey.findProgramAddressSync(
        [consts.AmmPubkey.toBuffer(), consts.ATokenPubkey.toBuffer(), consts.BTokenPubkey.toBuffer(), Buffer.from(consts.AUTHORITY_SEED)],
        new web3.PublicKey(process.env.DEX_PROGRAM_ID)
    )[0];

    const poolAccountA = (await tokenUtils.getOrCreateATA(
        poolAuthority,
        consts.ATokenPubkey,
        consts.connection,
        consts.SIGNER_KEYPAIR,
        true
    ));

    const poolAccountB = (await tokenUtils.getOrCreateATA(
        poolAuthority,
        consts.BTokenPubkey,
        consts.connection,
        consts.SIGNER_KEYPAIR,
        true
    ));

    console.log("poolAccountA:", poolAccountA);
    console.log("poolAccountB:", poolAccountB);
    
    let createPoolInstruction = await consts.dexProgram.methods
        .createPool()
        .accounts({
            amm: consts.AmmPubkey,
            pool: poolAccount,
            poolAuthority: poolAuthority,
            mintLiquidity: web3.PublicKey.findProgramAddressSync(
                [consts.AmmPubkey.toBuffer(), consts.ATokenPubkey.toBuffer(), consts.BTokenPubkey.toBuffer(), consts.LIQUIDITY_SEED],
                new web3.PublicKey(process.env.DEX_PROGRAM_ID)
            )[0],
            mintA: consts.ATokenPubkey,
            mintB: consts.BTokenPubkey,
            poolAccountA: poolAccountA,
            poolAccountB: poolAccountB,
            // poolAccountB: await tokenUtils.createATA(
            //     [[consts.BTokenPubkey]],
            //     [consts.SIGNER_PK],
            //     true
            // )[0],
            payer: consts.SIGNER_PK,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            system_program: consts.SOLANA_PROGRAM_ID
        }).instruction();

    // 将指令添加到交易中
    transaction.add(createPoolInstruction);
    
    // 获取最近的区块哈希并设置到交易中
    const { blockhash } = await consts.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer.publicKey;

    // 对交易进行签名
    transaction.sign(payer);
    
    // console.log(createPoolInstruction);

    // 发送并确认交易
    try {
        const signature = await web3.sendAndConfirmTransaction(
            consts.connection, 
            transaction, 
            [payer]
        );
        console.log("success, sig:", signature);
    } catch (error) {
        console.error("failed:", error);
    }
}

createPool();
