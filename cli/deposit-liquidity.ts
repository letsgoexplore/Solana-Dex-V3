import * as web3 from "@solana/web3.js";
import * as consts from "./utils/constant";
import { sendTx } from "./utils/tx_utils";
import * as tokenUtils from "./utils/token_utils";
import { BN } from '@coral-xyz/anchor';
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";

async function depositLiquidity() {
    let payer = consts.SIGNER_KEYPAIR;

    const amount_a = new BN(consts.amount_a);
    const amount_b = new BN(consts.amount_b);
    
    // 创建交易
    let transaction = new web3.Transaction();

    const poolAuthority = web3.PublicKey.findProgramAddressSync(
        [consts.AmmPubkey.toBuffer(), consts.ATokenPubkey.toBuffer(), consts.BTokenPubkey.toBuffer(), Buffer.from(consts.AUTHORITY_SEED)],
        new web3.PublicKey(process.env.DEX_PROGRAM_ID)
    )[0];
    console.log("poolAuthority:", poolAuthority);

    const depositor_account_liquidity = (await tokenUtils.getOrCreateATA(
        consts.SIGNER_PK,
        consts.mintLiquidity,
        consts.connection,
        consts.SIGNER_KEYPAIR,
        true
    ));
    console.log("depositor_account_liquidity:", depositor_account_liquidity);
    
    console.log("consts.amount_a:", consts.amount_a);
    let depositLiquidityInstruction = await consts.dexProgram.methods
        .depositLiquidity(amount_a, amount_b)
        .accounts({
            pool: consts.poolId,
            poolAuthority: poolAuthority,
            depositor: consts.SIGNER_PK,
            mintLiquidity: consts.mintLiquidity,
            mintA: consts.ATokenPubkey,
            mintB: consts.BTokenPubkey,
            poolAccountA: consts.poolAccountA,
            poolAccountB: consts.poolAccountB,
            depositorAccountLiquidity: depositor_account_liquidity,
            depositorAccountA: consts.deployerAccountA,
            depositorAccountB: consts.deployerAccountB,
            payer: consts.SIGNER_PK,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            system_program: consts.SOLANA_PROGRAM_ID
        }).instruction();

    // console.log("depositLiquidityInstruction:", depositLiquidityInstruction);
    // await sendTx(["deposit liquidity"], [depositLiquidityInstruction], [payer]);

    // 将指令添加到交易中
    transaction.add(depositLiquidityInstruction);
    
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

depositLiquidity();
