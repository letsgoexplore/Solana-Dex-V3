import * as web3 from "@solana/web3.js";
import * as consts from "./utils/constant";
import { sendTx } from "./utils/tx_utils";

async function createAmm() {
    let payer = consts.SIGNER_KEYPAIR;
    
    // 生成一个新的随机公钥作为AMM的ID
    const ammId = web3.Keypair.generate().publicKey;
    
    // 设置fee (例如0.3% = 30 basis points)
    const fee = 30;

    // 创建交易
    let transaction = new web3.Transaction();
    
    let createAmmInstruction = await consts.dexProgram.methods
        .createAmm(ammId, fee)
        .accounts({
            amm: web3.PublicKey.findProgramAddressSync(
                [ammId.toBuffer()],
                new web3.PublicKey(process.env.DEX_PROGRAM_ID)
            )[0],
            admin: consts.SIGNER_PK,
            payer: consts.SIGNER_PK,
            systemProgram: consts.SOLANA_PROGRAM_ID,
        }).instruction();

    // await sendTx(["create amm"], [createAmmInstruction], [payer]);

    // 将指令添加到交易中
    transaction.add(createAmmInstruction);
    
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

createAmm();
