use soroban_sdk::{token, Address, Env};

use crate::error::Error;

/// USDC token client wrapper for interacting with USDC contract on Stellar
/// This provides a convenient interface for all token operations in the Relifo system

pub struct TokenClient<'a> {
    env: &'a Env,
    address: Address,
}

impl<'a> TokenClient<'a> {
    /// Create a new token client instance
    /// 
    /// # Arguments
    /// * `env` - The Soroban environment
    /// * `address` - The address of the USDC token contract
    pub fn new(env: &'a Env, address: &Address) -> Self {
        Self {
            env,
            address: address.clone(),
        }
    }

    /// Get the underlying token client
    fn client(&self) -> token::Client<'a> {
        token::Client::new(self.env, &self.address)
    }

    /// Transfer USDC tokens from one address to another
    /// 
    /// # Arguments
    /// * `from` - Source address (must have authorized the transfer)
    /// * `to` - Destination address
    /// * `amount` - Amount to transfer (in smallest units)
    /// 
    /// # Returns
    /// * `Ok(())` on success
    /// * `Err(Error::InvalidAmount)` if amount is <= 0
    /// * `Err(Error::InsufficientBalance)` if from doesn't have enough tokens
    pub fn transfer(
        &self,
        from: &Address,
        to: &Address,
        amount: i128,
    ) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        
        // Check balance before transfer
        let balance = self.balance(from);
        if balance < amount {
            return Err(Error::InsufficientBalance);
        }

        self.client().transfer(from, to, &amount);
        Ok(())
    }

    /// Get USDC balance of an address
    /// 
    /// # Arguments
    /// * `account` - Address to check balance for
    /// 
    /// # Returns
    /// * Balance in smallest units (USDC has 7 decimals on Stellar)
    pub fn balance(&self, account: &Address) -> i128 {
        self.client().balance(account)
    }

    /// Approve spending allowance for a spender
    /// 
    /// # Arguments
    /// * `from` - Token owner address (must authorize)
    /// * `spender` - Address allowed to spend tokens
    /// * `amount` - Maximum amount spender can transfer
    /// * `expiration_ledger` - Ledger number when approval expires
    /// 
    /// # Returns
    /// * `Ok(())` on success
    /// * `Err(Error::InvalidAmount)` if amount is negative
    pub fn approve(
        &self,
        from: &Address,
        spender: &Address,
        amount: i128,
        expiration_ledger: u32,
    ) -> Result<(), Error> {
        if amount < 0 {
            return Err(Error::InvalidAmount);
        }

        self.client().approve(from, spender, &amount, &expiration_ledger);
        Ok(())
    }

    /// Get the current allowance for a spender
    /// 
    /// # Arguments
    /// * `from` - Token owner address
    /// * `spender` - Spender address
    /// 
    /// # Returns
    /// * Current allowance amount
    pub fn allowance(&self, from: &Address, spender: &Address) -> i128 {
        self.client().allowance(from, spender)
    }

    /// Transfer tokens using an existing allowance (transfer_from)
    /// 
    /// # Arguments
    /// * `spender` - Address spending the tokens (must have allowance)
    /// * `from` - Token owner address
    /// * `to` - Destination address
    /// * `amount` - Amount to transfer
    /// 
    /// # Returns
    /// * `Ok(())` on success
    /// * `Err(Error::InvalidAmount)` if amount is <= 0
    /// * `Err(Error::Unauthorized)` if spender lacks sufficient allowance
    pub fn transfer_from(
        &self,
        spender: &Address,
        from: &Address,
        to: &Address,
        amount: i128,
    ) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        // Check allowance
        let allowance = self.allowance(from, spender);
        if allowance < amount {
            return Err(Error::Unauthorized);
        }

        // Check balance
        let balance = self.balance(from);
        if balance < amount {
            return Err(Error::InsufficientBalance);
        }

        self.client().transfer_from(spender, from, to, &amount);
        Ok(())
    }

    /// Get token decimals
    /// 
    /// # Returns
    /// * Number of decimals (typically 7 for USDC on Stellar)
    pub fn decimals(&self) -> u32 {
        self.client().decimals()
    }

    /// Get token name
    /// 
    /// # Returns
    /// * Token name as String
    pub fn name(&self) -> soroban_sdk::String {
        self.client().name()
    }

    /// Get token symbol
    /// 
    /// # Returns
    /// * Token symbol as String
    pub fn symbol(&self) -> soroban_sdk::String {
        self.client().symbol()
    }
}

/// Helper function to convert USDC amount to display format
/// USDC on Stellar has 7 decimals
pub fn to_display_amount(amount: i128) -> i128 {
    amount / 10_000_000 // 7 decimals
}

/// Helper function to convert display amount to USDC contract amount
/// USDC on Stellar has 7 decimals
pub fn from_display_amount(amount: i128) -> i128 {
    amount * 10_000_000 // 7 decimals
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_amount_conversion() {
        // 100 USDC display = 1_000_000_000 contract units
        assert_eq!(from_display_amount(100), 1_000_000_000);
        
        // 1_000_000_000 contract units = 100 USDC display
        assert_eq!(to_display_amount(1_000_000_000), 100);
    }
}

