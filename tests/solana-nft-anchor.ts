import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaNftAnchor } from "../target/types/solana_nft_anchor";

import {
  walletAdapterIdentity
 } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
  findMasterEditionPda,
  findMetadataPda,
  mplTokenMetadata,
  MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {publicKey } from "@metaplex-foundation/umi";

import { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
 } from "@solana/spl-token";



describe("solana-nft-anchor", async () => {
  // Configure the client to use the devnet cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace
  .SolanaNftAnchor as Program<SolanaNftAnchor>;

  const signer = provider.wallet;

  const umi = createUmi("https://api.devnet.solana.com")
  .use(walletAdapterIdentity(signer))
  .use(mplTokenMetadata());

  // generate mint account
  const mint = anchor.web3.Keypair.generate();

  //derive the associated token account for mint
  const associatedTokenAddress = await getAssociatedTokenAddress(
    mint.publicKey,
    signer.publicKey,
  );

  // derive the metadata account
  let metadataAccount = findMetadataPda(umi, {
    mint: publicKey(mint.publicKey),
  })[0];

  // derive the master edition pda
  let masterEditionAccount = findMasterEditionPda(umi, {
    mint: publicKey(mint.publicKey),
  })[0];

  const metadata = {
    name: "Kobeni",
    symbol: "KBN",
    uri: "https://raw.githubusercontent.com/687c/solana-nft-native-client/main/metadata.json",
  };

  it("mints nft!", async () => {
    const tx = await program.methods.initNft(
      metadata.name,
      metadata.symbol,
      metadata.uri)
      .accounts({
        signer: provider.publicKey,
        mint: mint.publicKey,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mint])
      .rpc();

      console.log(`mint nft tx: 
      https://explorer.solana.com/tx/${tx}?cluster=devnet`);

      console.log(`Minted NFT: 
      https://explorer.solana.com/address/${mint.publicKey}?cluster=devnet`);
  });


});
