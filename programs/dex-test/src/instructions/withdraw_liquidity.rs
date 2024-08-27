use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Burn, Mint, Token, TokenAccount, Transfer},
};

use crate::{
    constants::{AUTHORITY_SEED, LIQUIDITY_SEED, MINIMUM_LIQUIDITY},
    state::{Amm, Pool},
};

pub fn withdraw_liquidity(ctx: Context<WithdrawLiquidity>, amount: u64) -> Result<()> {
    let authority_bump = ctx.bumps.pool_authority;
    let authority_seeds = &[
        &ctx.accounts.pool.amm.to_bytes(),
        &ctx.accounts.mint_a.key().to_bytes(),
        &ctx.accounts.mint_b.key().to_bytes(),
        AUTHORITY_SEED,
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    // Transfer tokens from the pool
    let amount_a = {
        let amount_f64 = amount as f64;
        let pool_account_a_amount_f64 = ctx.accounts.pool_account_a.amount as f64;
        let mint_liquidity_supply_f64 = ctx.accounts.mint_liquidity.supply as f64;
        let minimum_liquidity_f64 = MINIMUM_LIQUIDITY as f64;
    
        let numerator = amount_f64 * pool_account_a_amount_f64;
        let denominator = mint_liquidity_supply_f64 + minimum_liquidity_f64;
    
        if denominator == 0.0 {
            panic!("Denominator is zero");
        }
    
        let result = numerator / denominator;
        let floored_result = result.floor();
    
        if floored_result < 0.0 || floored_result > u64::MAX as f64 {
            panic!("Result out of u64 range");
        }
    
        floored_result as u64
    };

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_account_a.to_account_info(),
                to: ctx.accounts.depositor_account_a.to_account_info(),
                authority: ctx.accounts.pool_authority.to_account_info(),
            },
            signer_seeds,
        ),
        amount_a,
    )?;

    let amount_b = {
    let amount_f64 = amount as f64;
    let pool_account_b_amount_f64 = ctx.accounts.pool_account_b.amount as f64;
    let mint_liquidity_supply_f64 = ctx.accounts.mint_liquidity.supply as f64;
    let minimum_liquidity_f64 = MINIMUM_LIQUIDITY as f64;

    let numerator = amount_f64 * pool_account_b_amount_f64;
    let denominator = mint_liquidity_supply_f64 + minimum_liquidity_f64;

    if denominator == 0.0 {
        panic!("Denominator is zero");
    }

    let result = numerator / denominator;
    let floored_result = result.floor();

    if floored_result < 0.0 || floored_result > u64::MAX as f64 {
        panic!("Result out of u64 range");
    }

    floored_result as u64
};
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_account_b.to_account_info(),
                to: ctx.accounts.depositor_account_b.to_account_info(),
                authority: ctx.accounts.pool_authority.to_account_info(),
            },
            signer_seeds,
        ),
        amount_b,
    )?;

    // Burn the liquidity tokens
    // It will fail if the amount is invalid
    token::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.mint_liquidity.to_account_info(),
                from: ctx.accounts.depositor_account_liquidity.to_account_info(),
                authority: ctx.accounts.depositor.to_account_info(),
            },
        ),
        amount,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawLiquidity<'info> {
    #[account(
        seeds = [
            amm.id.as_ref()
        ],
        bump,
    )]
    pub amm: Account<'info, Amm>,

    #[account(
        seeds = [
            pool.amm.as_ref(),
            pool.mint_a.key().as_ref(),
            pool.mint_b.key().as_ref(),
        ],
        bump,
        has_one = mint_a,
        has_one = mint_b,
    )]
    pub pool: Account<'info, Pool>,

    /// CHECK: Read only authority
    #[account(
        seeds = [
            pool.amm.as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
            AUTHORITY_SEED,
        ],
        bump,
    )]
    pub pool_authority: AccountInfo<'info>,

    /// The account paying for all rents
    pub depositor: Signer<'info>,

    #[account(
        mut,
        seeds = [
            pool.amm.as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
            LIQUIDITY_SEED,
        ],
        bump,
    )]
    pub mint_liquidity: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub mint_a: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub mint_b: Box<Account<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = pool_authority,
    )]
    pub pool_account_a: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint_b,
        associated_token::authority = pool_authority,
    )]
    pub pool_account_b: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint_liquidity,
        associated_token::authority = depositor,
    )]
    pub depositor_account_liquidity: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_a,
        associated_token::authority = depositor,
    )]
    pub depositor_account_a: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_b,
        associated_token::authority = depositor,
    )]
    pub depositor_account_b: Box<Account<'info, TokenAccount>>,

    /// The account paying for all rents
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Solana ecosystem accounts
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
