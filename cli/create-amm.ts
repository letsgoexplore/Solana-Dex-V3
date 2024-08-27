import * as anchor from '@coral-xyz/anchor';
import { Command } from 'commander';
import type { Program } from '@coral-xyz/anchor';
import { readFileSync } from 'fs';
import { join } from 'path';

const program = new Command();

program
  .version('0.1.0')
  .description('CLI for interacting with the AMM program')
  .requiredOption('-i, --id <id>', 'AMM ID')
  .requiredOption('-f, --fee <fee>', 'AMM Fee')
  .option('-k, --amm-key <ammKey>', 'AMM Key')
  .option('-a, --admin-key <adminKey>', 'Admin Public Key');

program.parse(process.argv);

const options = program.opts();

const provider = anchor.AnchorProvider.env();
const connection = provider.connection;
anchor.setProvider(provider);

const programId = new anchor.web3.PublicKey('YOUR_PROGRAM_ID_HERE'); // 替换为您的程序 ID
const program = anchor.workspace.DexTest as Program<any>;

async function main() {
  const ammKey = options['amm-key'] ? new anchor.web3.PublicKey(options['amm-key']) : anchor.web3.Keypair.generate().publicKey;
  const adminKey = options['admin-key'] ? new anchor.web3.PublicKey(options['admin-key']) : provider.wallet.publicKey;

  try {
    await program.methods.createAmm(new anchor.BN(options.id), new anchor.BN(options.fee))
      .accounts({ amm: ammKey, admin: adminKey })
      .rpc();
      
    console.log('AMM created successfully');
  } catch (error) {
    console.error('Error creating AMM:', error);
  }
}

main();
