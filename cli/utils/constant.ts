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
export const connection = new Connection(process.env.RPC_URL);
export const provider = new AnchorProvider(connection, SIGNER_WALLET, { commitment: "processed", });//processed < confirmed < finalized
console.log(`>>>>>>>>>current RPC_URL: ${process.env.RPC_URL}`);


//program
export const dexProgram = new Program(dexIdl as anchor.Idl, process.env.DEX_PROGRAM_ID, provider);
export const dexProgramId = process.env.DEX_PROGRAM_ID;
console.log(`>>>>>>>>>current DEX_PROGRAM_ID: ${process.env.DEX_PROGRAM_ID}`);

export const SOLANA_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");