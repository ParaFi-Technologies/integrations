import { Connection, PublicKey, StakeProgram } from "@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const voteAccount = new PublicKey("pt1LsjkNwqCKdYYfc35ToDkqtEG9pswLTJNaMo8inft");

// Get validator info
const validatorInfo = await connection.getVoteAccounts();
const ourValidator = validatorInfo.current.find(
  v => v.votePubkey === "pt1LsjkNwqCKdYYfc35ToDkqtEG9pswLTJNaMo8inft"
);

console.log(ourValidator.activatedStake / 1_000_000_000 + " SOL");

for (const epoch of ourValidator.epochCredits) {
    console.log(epoch);
    console.log(epoch[1] - epoch[2]);
}
