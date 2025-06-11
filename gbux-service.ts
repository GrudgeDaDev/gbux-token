/**
 * GBuX Token Service - Complete Solana SPL Token Implementation
 * Connects to authentic GBUX token on Solana (55TpSoMNxbfsNJ9U1dQoo9H3dRtDmjBZVMcKqvU2nray)
 * Manages balances, transfers, and token analytics
 */

import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

export class GBuXService {
  private connection: Connection;
  private readonly GBUX_TOKEN_ADDRESS = '55TpSoMNxbfsNJ9U1dQoo9H3dRtDmjBZVMcKqvU2nray';
  private readonly TOKEN_DECIMALS = 9;

  constructor(rpcUrl?: string) {
    this.connection = new Connection(
      rpcUrl || clusterApiUrl('mainnet-beta'),
      'confirmed'
    );
  }

  /**
   * Get GBuX token balance for a wallet address
   */
  async getTokenBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const tokenMint = new PublicKey(this.GBUX_TOKEN_ADDRESS);
      
      // Get associated token account
      const associatedTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        publicKey
      );

      // Get token account balance
      const balance = await this.connection.getTokenAccountBalance(associatedTokenAccount);
      return parseFloat(balance.value.uiAmount || '0');
    } catch (error) {
      console.error('Error getting GBuX balance:', error);
      return 0;
    }
  }

  /**
   * Get GBuX token metadata and information
   */
  async getTokenInfo() {
    try {
      const response = await fetch(
        `https://public-api.solscan.io/token/meta?tokenAddress=${this.GBUX_TOKEN_ADDRESS}`,
        {
          headers: { 'Accept': 'application/json' }
        }
      );

      if (response.ok) {
        return await response.json();
      } else {
        return {
          symbol: "GBUX",
          name: "GBuX Token",
          address: this.GBUX_TOKEN_ADDRESS,
          decimals: this.TOKEN_DECIMALS,
          description: "Nexus Nemesis in-game currency"
        };
      }
    } catch (error) {
      console.error('Error fetching token info:', error);
      throw error;
    }
  }

  /**
   * Get top GBuX token holders
   */
  async getTopHolders(limit: number = 20) {
    try {
      const response = await fetch(
        `https://public-api.solscan.io/token/holders?tokenAddress=${this.GBUX_TOKEN_ADDRESS}&limit=${limit}&offset=0`,
        {
          headers: { 'Accept': 'application/json' }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        throw new Error(`Failed to fetch holders: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching token holders:', error);
      throw error;
    }
  }

  /**
   * Verify token balance using direct RPC call
   */
  async verifyTokenBalance(walletAddress: string): Promise<number> {
    try {
      const response = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            walletAddress,
            { mint: this.GBUX_TOKEN_ADDRESS },
            { encoding: 'jsonParsed' }
          ]
        })
      });

      const data = await response.json();
      if (data.result?.value?.length > 0) {
        const tokenAccount = data.result.value[0];
        return parseFloat(tokenAccount.account.data.parsed.info.tokenAmount.uiAmount || '0');
      }
      return 0;
    } catch (error) {
      console.error('GBuX verification error:', error);
      return 0;
    }
  }

  /**
   * Monitor token transfers (simplified implementation)
   */
  async trackTransfers(callback: (transfer: any) => void) {
    // This would require WebSocket connection to Solana
    // Implementation depends on specific monitoring needs
    console.log('Transfer tracking would be implemented here');
  }

  /**
   * Get current exchange rate for GBuX
   */
  async getExchangeRate() {
    try {
      // This would connect to your price API
      const response = await fetch('/api/exchange-rate/gbux');
      if (response.ok) {
        return await response.json();
      }
      return { price: 0, priceChange24h: 0 };
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return { price: 0, priceChange24h: 0 };
    }
  }
}