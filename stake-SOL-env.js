import { Connection, Keypair, LAMPORTS_PER_SOL, StakeProgram, PublicKey, Transaction } from "@solana/web3.js";
import dotenv from 'dotenv';

dotenv.config();

// Load wallet from environment variable
const secretKey = JSON.parse(process.env.WALLET_SECRET_KEY || '');
const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));

// Initialize connection and accounts
const connection = new Connection("https://api.testnet.solana.com");
const voteAccount = new PublicKey("pt1EynDP4YiussYbaXFTudJfmYYt3hwpUYgG7jBv9GH");
const stakeAccount = Keypair.generate();

async function createAndDelegateStake(amountInSOL) {
  // Create a new transaction
  const transaction = new Transaction();

  // 1. Add stake account instruction
  transaction.add(StakeProgram.createAccount({
    fromPubkey: wallet.publicKey,
    stakePubkey: stakeAccount.publicKey,
    authorized: {
      staker: wallet.publicKey,
      withdrawer: wallet.publicKey
    },
    lamports: amountInSOL * LAMPORTS_PER_SOL
  }));

  // 2. Add delegate stake instruction
  transaction.add(StakeProgram.delegate({
    stakePubkey: stakeAccount.publicKey,
    authorizedPubkey: wallet.publicKey,
    votePubkey: voteAccount
  }));

  try {
    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign transaction
    transaction.sign(wallet, stakeAccount);

    // Send and confirm transaction
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction({
      signature,
      blockhash: transaction.recentBlockhash,
      lastValidBlockHeight: await connection.getBlockHeight()
    });
    
    console.log(`Successfully staked ${amountInSOL} SOL to ${voteAccount}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example: Stake 1 SOL
createAndDelegateStake(7);
