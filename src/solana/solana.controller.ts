import { Controller, Post, Body } from '@nestjs/common';
import { SolanaService } from './solana.service';

@Controller('solana')
export class SolanaController {
  constructor(private readonly solanaService: SolanaService) {}

  @Post('buy-token')
  async buyToken(
    @Body()
    body: {
      publicKey: string;
      tokenMint: string;
      amount: number;
      denominatedInSol: boolean;
      slippage: number;
      priorityFee: number;
    },
  ) {
    const {
      publicKey,
      tokenMint,
      amount,
      denominatedInSol,
      slippage,
      priorityFee,
    } = body;
    const signature = await this.solanaService.buyToken(
      publicKey,
      tokenMint,
      amount,
      denominatedInSol,
      slippage,
      priorityFee,
    );
    return { signature, explorer: `https://solscan.io/tx/${signature}` };
  }
}
