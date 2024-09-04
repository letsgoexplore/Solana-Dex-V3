import {
    PublicKey,
    Keypair,
    Connection,
} from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import {
    TOKEN_PROGRAM_ID,
    createMint,
    createAssociatedTokenAccountInstruction,
    getAccount,
    getAssociatedTokenAddressSync,
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from "@solana/spl-token";
import { sendTx } from "./tx_utils";
import { SIGNER_KEYPAIR, SIGNER_PK, SIGNER_WALLET, connection } from "./constant";

// let [usdc] = new Array();
// // let usdc_pk: PublicKey = null;

// type TokenConfig = {
//     mint: PublicKey,
//     oracle: PublicKey,
//     decimals: number
// }

// export async function get_usdc() {
//     usdc_pk = base_get_spl(usdc_pk, process.env.USDC_MINT);
//     return usdc_pk;
// }


// export async function get_vsol() {
//     vsol_pk = base_get_spl(vsol_pk, process.env.V_SOL_MINT);
//     return vsol_pk;
// }



// async function base_get_spl(spl_pk: PublicKey, config_spl_mint: string, spl_oracle: string, decimals) {
//     if (spl_pk) return spl_pk;

//     if (CURRENT_ENV != ENV_ENUM.DEV) return new PublicKey(config_spl_mint);
//     spl_pk = await createAndMintToDeployer(connection, SIGNER_KEYPAIR, 100, 6);
//     return spl_pk;
// }



// // Create spl mint and mint several tokens to deployer
// export const createAndMintToDeployer = async (connection: Connection, creator: Keypair, mintedAmount = 100, decimals = 6) => {
//     console.log("createAndMintToDeployer start");
//     // await connection.confirmTransaction(
//     //     await connection.requestAirdrop(creator.publicKey, 10 ** 10)
//     // );
//     // await createMint(
//     //     connection,
//     //     creator,
//     //     creator.publicKey,
//     //     decimals,
//     //     6,
//     //     splMint
//     // );

//     const splTokenMintKeyPair = new Keypair();
//     await createMint(
//         connection,
//         creator, // 付款账户
//         creator.publicKey, // 代币的创建者
//         creator.publicKey, // 代币的授权者，可以为空
//         decimals, // 代币的小数位数
//         splTokenMintKeyPair,//代币Mint账户专有的KeyPair
//     );

//     //mint amount to user
//     await mintAmountTo(connection, creator, creator.publicKey, splTokenMintKeyPair.publicKey, mintedAmount, decimals);

//     return splTokenMintKeyPair.publicKey;
// }



// // mint several tokens to user
// export const mintAmountTo = async (connection: Connection, creator: Keypair, mintReceiptor: PublicKey,
//     splMint: PublicKey, mintedAmount = 100, decimals = 6,) => {
//     console.log(`mintAmountTo start. mintReceiptor:${mintReceiptor}`);

//     // await connection.confirmTransaction(await connection.requestAirdrop(mintReceiptor, 10 ** 10));
//     const receiptorAta = await getOrCreateATA(
//         mintReceiptor,
//         splMint,
//         connection,
//         creator,
//         true
//     );

//     await mintTo(
//         connection,
//         creator,  //付款账户
//         splMint, //代币Mint账户的pubKey
//         receiptorAta,//接收者对应该代币的ADA地址
//         creator,  //代币的authority用户
//         mintedAmount * 10 ** decimals,// 铸造的数量
//     );


// }

export const createATA = async (
    mints: PublicKey[][], 
    owners: PublicKey[], 
    execute: boolean = false
) => {
    let ixs = [];

    for (let i = 0; i < owners.length; ++i) {
        const owner = owners[i];
        for (const mint of mints[i]) {
            const ata = getAssociatedTokenAddressSync(mint, owner, true);
            try {
                const res = await getAccount(connection, ata);
            } catch (e) {
                if (String(e).includes("TokenAccountNotFoundError")) {
                    ixs.push(createAssociatedTokenAccountInstruction(
                        SIGNER_PK,
                        ata,
                        owner,
                        mint
                    ))
                } else {
                    console.log(e);
                }
            }
        }
    }

    if (execute) {
        console.log("Creating ATAs...");
        await sendTx(["createATA"], ixs, [SIGNER_KEYPAIR]);
        return;
    }
    return ixs;
}

export const getOrCreateATA = async (ataOwner: PublicKey, splMint: PublicKey, connect: Connection = connection, payer: Keypair = SIGNER_KEYPAIR, allowOwnerOffCurve: boolean = true) => {
    console.log(`owner: ${ataOwner} splMint: ${splMint}. getOrCreateATA start.`);
    let i=0;
    while (true) {
        try {
            const receiptorAta = await getOrCreateAssociatedTokenAccount(
                connect,
                payer,
                splMint,
                ataOwner,
                allowOwnerOffCurve
            );
            console.log("ata address:", receiptorAta.address.toBase58());
            return receiptorAta.address;
        } catch (ex) {
            console.error(`getOrCreateATA fail, retry:${i++}`, ex);
        }
    }
}



export const getATABalance = async function (connection: Connection, ata: PublicKey) {
    try {
        // Get the token account information
        const accountInfo = await getAccount(connection, ata, undefined, TOKEN_PROGRAM_ID);
        // The amount is stored as a big number, so we need to convert it to a regular number
        const balance = Number(accountInfo.amount);
        return balance;
    } catch (error) {
        console.error("Failed to get ATA balance:", error);
        throw error;
    }
}



