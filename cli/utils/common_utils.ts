require("dotenv").config()
const web3 = require("@solana/web3.js");
import { PublicKey } from "@solana/web3.js";
import * as solanaStakePool from '@solana/spl-stake-pool';

/**
 * 休眠毫秒
 * @param ms 
 * @returns 
 */
export function sleep_millisecond(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export const getArg = (argName) => {
    const args = process.argv.slice(2);
    const arg = args.find((temp) => temp.startsWith(`--${argName}=`));
    if (arg) {
        return arg.split("=")[1];
    } else {
        console.log(`Missing ${argName} argument`);
        return null;
    }
}

export const getStakeAmount = async (amount) => {
    const connection = new web3.Connection(process.env.RPC_URL);
    const res = (await solanaStakePool.getStakePoolAccount(
        connection, 
        new PublicKey("Fu9BYC6tWBo1KMKaP3CFoKfRhqv9akmy3DuYwnCyWiyC")
    )).account.data;
    return String(Math.floor(amount * Number(res.poolTokenSupply) / Number(res.totalLamports)));
}

// Jupiter Swap API
export const getQuote = async (
    fromToken: PublicKey,
    toToken: PublicKey,
    amount: string,
    slippage: string,
    mode: string // "ExactIn/ExactOut"
) => {
    return (
        await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${fromToken.toBase58()}&outputMint=${toToken.toBase58()}&amount=${amount}&slippageBps=${slippage}&onlyDirectRoutes=true&swapMode=${mode}`)
    ).json();
}

export const getSwapInstructions = async (
    initiator: PublicKey,
    quoteResponse: any
) => {
    return await (await fetch('https://quote-api.jup.ag/v6/swap-instructions', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            // quoteResponse from /quote api
            quoteResponse,
            userPublicKey: initiator.toBase58(),
        })
    })).json();
}

