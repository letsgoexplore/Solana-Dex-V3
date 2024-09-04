import {
    PublicKey,
    Keypair,
    Connection,
} from "@solana/web3.js";
import fs from 'fs';
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";

import { IDL as dexIdl } from "../../target/types/dex_test";
require("dotenv").config()


export type TokenConfig = {
    mint: PublicKey,
    oracle_price_feed: PublicKey,
    decimals: number
}

//env
// export const CURRENT_ENV = process.env.ENV;

//signer
const keyData = fs.readFileSync(process.env.KEYPAIR_PATH, 'utf-8');
export const SIGNER_KEYPAIR = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(keyData)));
export const SIGNER_WALLET = new Wallet(SIGNER_KEYPAIR);
export const SIGNER_PK = SIGNER_WALLET.publicKey;
console.log(`>>>>>>>>>current SIGNER_PK: ${SIGNER_PK}`);

const UserkeyData = fs.readFileSync(process.env.USER_KEYPAIR_PATH, 'utf-8');
export const USER_KEYPAIR = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(UserkeyData)));
export const USER_WALLET = new Wallet(USER_KEYPAIR);
export const USER_PK = USER_WALLET.publicKey;
console.log(`>>>>>>>>>current USER_PK: ${USER_PK}`);

//provider
export const connection = new Connection(process.env.RPC_URL, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000,
  });
export const provider = new AnchorProvider(connection, SIGNER_WALLET, { commitment: "processed", });//processed < confirmed < finalized
console.log(`>>>>>>>>>current RPC_URL: ${process.env.RPC_URL}`);

//program
export const dexProgram = new Program(dexIdl as anchor.Idl, process.env.DEX_PROGRAM_ID, provider);
console.log(`>>>>>>>>>current DEX_PROGRAM_ID: ${process.env.DEX_PROGRAM_ID}`);

export const poolId = new PublicKey(process.env.POOL_ID);
console.log(`>>>>>>>>>current POOL_ID: ${poolId}`);

export const mintLiquidity = new PublicKey(process.env.MINT_AUTHORITY);
console.log(`>>>>>>>>>current mintLiquidity: ${mintLiquidity}`);

export const poolAccountA = new PublicKey(process.env.POOL_ACCOUNT_A);
console.log(`>>>>>>>>>current poolAccountA: ${poolAccountA}`);

export const poolAccountB = new PublicKey(process.env.POOL_ACCOUNT_B);
console.log(`>>>>>>>>>current poolAccountB: ${poolAccountB}`);

export const deployerAccountA = new PublicKey(process.env.DEPLOYER_ACCOUNT_A);
console.log(`>>>>>>>>>current deployerAccountA: ${deployerAccountA}`);

export const deployerAccountB = new PublicKey(process.env.DEPLOYER_ACCOUNT_B);
console.log(`>>>>>>>>>current deployerAccountB: ${deployerAccountB}`);

export const userAccountA = new PublicKey(process.env.USER_ACCOUNT_A);
console.log(`>>>>>>>>>current userAccountA: ${userAccountA}`);

export const userAccountB = new PublicKey(process.env.USER_ACCOUNT_B);
console.log(`>>>>>>>>>current userAccountB: ${userAccountB}`);

export const SOLANA_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

export const AmmPubkey = new PublicKey(process.env.AMM_ID);
console.log(`>>>>>>>>>current AmmPubkey: ${AmmPubkey}`);

export const ATokenPubkey = new PublicKey(process.env.TOKEN_A);
console.log(`>>>>>>>>>current TokenAKeyData: ${ATokenPubkey}`);

export const BTokenPubkey = new PublicKey(process.env.TOKEN_B);
console.log(`>>>>>>>>>current TokenBKeyData: ${BTokenPubkey}`);

export const LIQUIDITY_SEED = Buffer.from("liquidity");
console.log(`>>>>>>>>>current LIQUIDITY_SEED: ${LIQUIDITY_SEED}`);

export const AUTHORITY_SEED = Buffer.from("authority");
console.log(`>>>>>>>>>current AUTHORITY_SEED: ${AUTHORITY_SEED}`);

export const amount_a = 100000;
export const amount_b = 10000;
export const swap_amout = 5000;
export const min_output_amount = 0;