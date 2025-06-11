/**
 * GBuX Token - Main Export File
 * Entry point for the GBuX token implementation package
 */

export { GBuXService } from './gbux-service';
export { RealGBUXService } from './real-gbux-service';

// Token constants
export const GBUX_TOKEN_ADDRESS = '55TpSoMNxbfsNJ9U1dQoo9H3dRtDmjBZVMcKqvU2nray';
export const GBUX_TOKEN_DECIMALS = 9;

// Token metadata
export const GBUX_TOKEN_METADATA = {
  name: "GBuX Token",
  symbol: "GBUX",
  decimals: 9,
  description: "Nexus Nemesis in-game currency",
  image: "https://i.imgur.com/cck8Rc3.png",
  address: GBUX_TOKEN_ADDRESS
};

// Default export
export default GBuXService;