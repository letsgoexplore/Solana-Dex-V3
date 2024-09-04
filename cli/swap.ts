import * as web3 from "@solana/web3.js";
import * as consts from "./utils/constant";
import { sendTx } from "./utils/tx_utils";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
    getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";
import { BN } from '@coral-xyz/anchor';


async function swap() {
    let payer = consts.USER_KEYPAIR;

    let transaction = new web3.Transaction();

    const poolAuthority = web3.PublicKey.findProgramAddressSync(
        [consts.AmmPubkey.toBuffer(), consts.ATokenPubkey.toBuffer(), consts.BTokenPubkey.toBuffer(), Buffer.from(consts.AUTHORITY_SEED)],
        new web3.PublicKey(process.env.DEX_PROGRAM_ID)
    )[0];
    
    const swap_amout = new BN(consts.swap_amout);
    const min_output_amount = new BN(consts.min_output_amount);

    let swapInstruction = await consts.dexProgram.methods
        .swap(true, swap_amout, min_output_amount)
        .accounts({
            amm: consts.AmmPubkey,
            pool: consts.poolId,
            poolAuthority: poolAuthority,
            trader: consts.USER_PK,
            mintA: consts.ATokenPubkey,
            mintB: consts.BTokenPubkey,
            poolAccountA: consts.poolAccountA,
            poolAccountB: consts.poolAccountB,
            traderAccountA: consts.userAccountA,
            traderAccountB: consts.userAccountB,
            systemProgram: consts.SOLANA_PROGRAM_ID,
            payer: consts.USER_PK,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            system_program: consts.SOLANA_PROGRAM_ID
        }).instruction();

    // await sendTx(["swap"], [swapInstruction], [payer]);

    // 将指令添加到交易中
    transaction.add(swapInstruction);
    
    // 获取最近的区块哈希并设置到交易中
    const { blockhash } = await consts.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer.publicKey;

    // 对交易进行签名
    transaction.sign(payer);

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

swap();
