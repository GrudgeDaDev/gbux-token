import { Express } from "express";
import fetch from "node-fetch";
import { VersionedTransaction, PublicKey, Connection } from "@solana/web3.js";

// Define the token metadata
const GBUX_TOKEN_ADDRESS = "55TpSoMNxbfsNJ9U1dQoo9H3dRtDmjBZVMcKqvU2nray";
const SOLANA_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com"; // Use a more reliable endpoint in production

// Solana connection instance
/**
 * GBUX-Solana Integration Routes
 * Created by: Racalvin The Pirate King
 * Studio: Grudge Studio
 * Project: Nexus Nemesis - Web3 Trading Card Game
 */

const connection = new Connection(SOLANA_RPC_ENDPOINT);

export function registerGBuXSolanaRoutes(app: Express) {
  
  // Endpoint to verify a user's GBuX balance on Solana
  app.get("/api/solana/gbux/verify/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      // Validate Solana address format
      if (!address || address.length !== 44) {
        return res.status(400).json({ success: false, message: "Invalid Solana address format" });
      }
      
      // Create a Solana public key from address
      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(address);
      } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid Solana address" });
      }
      
      // Verify the balance using Solscan API first (they have better token metadata)
      try {
        const solscanResponse = await fetch(`https://public-api.solscan.io/account/tokens?account=${address}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (solscanResponse.ok) {
          const tokens = await solscanResponse.json();
          
          // Find GBuX token in the user's tokens
          const gbuxToken = tokens.find((token: any) => token.tokenAddress === GBUX_TOKEN_ADDRESS);
          
          if (gbuxToken) {
            // Convert from token amount to human-readable amount
            const tokenBalance = parseFloat(gbuxToken.tokenAmount.amount) / Math.pow(10, gbuxToken.tokenAmount.decimals);
            return res.json({
              success: true,
              address,
              balance: tokenBalance.toString(),
              verified: true,
              source: "solscan"
            });
          }
        }
      } catch (solscanError) {
        console.error("Solscan API error:", solscanError);
        // We'll fall back to the Solana RPC directly if Solscan fails
      }
      
      // Fallback to Solana RPC API
      try {
        // Get token accounts owned by this address
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") } // Token program ID
        );
        
        // Find GBuX token account
        const gbuxAccount = tokenAccounts.value.find(
          (account) => account.account.data.parsed.info.mint === GBUX_TOKEN_ADDRESS
        );
        
        if (gbuxAccount) {
          const balance = gbuxAccount.account.data.parsed.info.tokenAmount.uiAmount;
          return res.json({
            success: true,
            address,
            balance: balance.toString(),
            verified: true,
            source: "solana_rpc"
          });
        } else {
          // User has no GBuX tokens
          return res.json({
            success: true,
            address,
            balance: "0",
            verified: true,
            source: "solana_rpc"
          });
        }
      } catch (rpcError) {
        console.error("Solana RPC error:", rpcError);
        return res.status(500).json({ success: false, message: "Failed to verify token balance" });
      }
    } catch (error) {
      console.error("Error verifying GBuX balance:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  
  // Endpoint to get token information
  app.get("/api/solana/gbux/info", async (req, res) => {
    try {
      // Try to get token info from Solscan
      const response = await fetch(`https://public-api.solscan.io/token/meta?tokenAddress=${GBUX_TOKEN_ADDRESS}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const tokenInfo = await response.json();
        return res.json({
          success: true,
          tokenInfo
        });
      } else {
        // Basic info if API fails
        return res.json({
          success: true,
          tokenInfo: {
            symbol: "GBuX",
            name: "GBuX",
            address: GBUX_TOKEN_ADDRESS,
            decimals: 9,
            icon: "",
            description: "GBuX is the in-game currency for Nexus Nemesis"
          }
        });
      }
    } catch (error) {
      console.error("Error fetching GBuX token info:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch token information" });
    }
  });
  
  // Endpoint to get recent GBuX token holders (top 20)
  app.get("/api/solana/gbux/holders", async (req, res) => {
    try {
      const response = await fetch(`https://public-api.solscan.io/token/holders?tokenAddress=${GBUX_TOKEN_ADDRESS}&limit=20&offset=0`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const holdersData = await response.json();
        return res.json({
          success: true,
          holders: holdersData.data
        });
      } else {
        return res.status(response.status).json({ success: false, message: "Failed to fetch token holders" });
      }
    } catch (error) {
      console.error("Error fetching GBuX holders:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
}