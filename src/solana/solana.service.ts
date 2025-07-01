import { Injectable } from '@nestjs/common';
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import * as bs58 from 'bs58';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class SolanaService {
  private readonly connection: Connection;
  private readonly pumpPortalApi: string;

  constructor() {
    this.connection = new Connection(process.env.RPC_ENDPOINT, 'confirmed');
    this.pumpPortalApi = process.env.PUMP_PORTAL_API;
  }

  async buyToken(
    publicKey: string,
    tokenMint: string,
    amount: number,
    denominatedInSol: boolean,
    slippage: number,
    priorityFee: number,
  ): Promise<string> {
    try {
      // Gửi yêu cầu tới PumpPortal API để lấy serialized transaction
      const response = await axios.post(
        this.pumpPortalApi,
        {
          publicKey,
          action: 'buy',
          mint: tokenMint, // Địa chỉ hợp đồng token (lấy từ URL trên pump.fun, phần sau '/')
          denominatedInSol: denominatedInSol.toString(),
          amount,
          slippage,
          priorityFee,
          pool: 'pump',
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (response.status !== 200) {
        throw new Error(`API error: ${response.statusText}`);
      }

      // Deserialize giao dịch
      const data = await response.data.arrayBuffer();
      const tx = VersionedTransaction.deserialize(new Uint8Array(data));

      // Ký giao dịch với private key
      const signerKeyPair = Keypair.fromSecretKey(
        bs58.default.decode(process.env.WALLET_PRIVATE_KEY),
      );
      tx.sign([signerKeyPair]);

      // Gửi giao dịch tới mạng Solana
      const signature = await this.connection.sendTransaction(tx);
      console.log(`Transaction: https://solscan.io/tx/${signature}`);

      return signature;
    } catch (error) {
      throw new Error(`Failed to buy token: ${error.message}`);
    }
  }
}
