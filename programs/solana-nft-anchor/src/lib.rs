use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        Metadata,
        MetadataAccount,
        CreateMasterEditionV3,
        CreateMetadataAccountsV3,
        create_master_edition_v3,
        create_metadata_accounts_v3,
    },
    token::{Mint, MintTo, mint_to, Token, TokenAccount},
};
use mpl_token_metadata::{
    pda::{find_master_edition_account, find_metadata_account}, // new
    state::DataV2,
};

declare_id!("2vLSwjewmNUkemqDwCy924ToVgZTgErx3mcnfF7XFSeu");

#[program]
pub mod solana_nft_anchor {
    use super::*;

    pub fn init_nft(ctx: Context<InitNFT>) -> Result<()> {
        //create mint account
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.associated_token_account.to_account_info(),
                authority: ctx.accounts.signer.to_account_info()
            },
        );

        mint_to(cpi_context, 1)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitNFT<'info> {
    #[account(mut, signer)]
    signer: AccountInfo<'info>,
    #[account(
        init,
        payer = signer,
        mint::decimals = 0,
        mint::authority = signer.key(),
        mint::freeze_authority = signer.key(),
    )]

    pub mint: Account<'info, Mint>, // new
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer,
    )]
    pub associated_token_account: Account<'info, TokenAccount>, // new

    #[account(
        mut,
        address = find_master_edition_account(&mint.key()).0,
    )]
    pub metadata: AccountInfo<'info>,

    #[account(
        mut,
        address = find_master_edition_account(&mint.key()).0,
    )]
    pub master_edition_account: AccountInfo<'info>,

    pub token_program: Program<'info, Token>, // new
    pub associated_token_program: Program<'info, AssociatedToken>, // new
    pub system_program: Program<'info, System>, // bew
    pub rent: Sysvar<'info, Rent> // new
}


