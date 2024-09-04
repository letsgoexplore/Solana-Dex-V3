import { connection } from "./constant";
import { LAMPORTS_PER_SOL, PublicKey, Keypair, TransactionInstruction } from "@solana/web3.js";
import { buildAndSendTxnWithLogs, buildVersionedTransaction, getComputeUnitLimitInstruction, getPriorityFeeInstruction, simulateTx, sleep } from "./instruction_utils";



export async function air_drop_sol(receiptor_pk: PublicKey) {
    console.log(`>>${receiptor_pk} balance.before airdrop:${await connection.getBalance(receiptor_pk)}`);

    let airdropSignature = await connection.requestAirdrop(receiptor_pk, 10 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);

    console.log(`>>${receiptor_pk} balance.after airdrop:${await connection.getBalance(receiptor_pk)}`);
}

export const instructionDataToTransactionInstruction = (instructionPayload: any) => {
    if (instructionPayload === null) return null;
  
    return new TransactionInstruction({
        programId: new PublicKey(instructionPayload.programId),
        keys: instructionPayload.accounts.map((key) => ({
            pubkey: new PublicKey(key.pubkey),
            isSigner: key.isSigner,
            isWritable: key.isWritable,
        })),
        data: Buffer.from(instructionPayload.data, "base64"),
    });
};

export async function sendTx(
    txLabel: string[], 
    instructions: TransactionInstruction[], 
    signer_keypairs: Keypair[], 
) {
    let payer_pk = signer_keypairs[0].publicKey;
    if (!instructions || instructions.length == 0) return;
    console.log(`start txLabel:${txLabel.join(",")} \r\n payer: ${payer_pk} signers: ${signer_keypairs.map(r => r.publicKey).join(",")}`);
    instructions.map(row => console.table(row.keys));
    //优先费
    console.log(instructions.length);
    let friorityFeeList = [await getComputeUnitLimitInstruction(),await getPriorityFeeInstruction(100000)];
    instructions =friorityFeeList.concat(instructions);
    console.log(instructions.length);

    //simulateTx
    await simulateTx(txLabel, instructions, signer_keypairs, connection);



    let i = 20;
    console.log(`tx: ${txLabel} sending...`);
    while (i > 0) {
        i--;
        try {
            const preTxn = await buildVersionedTransaction(connection, payer_pk, instructions);
            const txHash = await buildAndSendTxnWithLogs(connection, preTxn, signer_keypairs, true);
            console.log(`tx:${txLabel} success. txHash:`, txHash);
            break;
        } catch (ex) {
            console.error(ex);
        }
        console.log(`tx:${txLabel}. left times:${i}`);
        await sleep(1000);
    }



}
