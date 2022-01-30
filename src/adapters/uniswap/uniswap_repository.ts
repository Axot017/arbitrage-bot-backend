import { legos } from '@studydefi/money-legos';
import { ethers } from 'ethers';

import { Cryptocurrency } from 'src/domain/cryptocurrency';
import { Exchange } from 'src/domain/exchange';
import { ExchangeRepository } from 'src/interactors/ports/exchnge_repository';

export class UniswapRepository implements ExchangeRepository {
  readonly uniswapContract: ethers.Contract;

  constructor(private readonly provider: ethers.providers.JsonRpcProvider) {
    this.uniswapContract = new ethers.Contract(
      legos.uniswapV2.router02.address,
      legos.uniswapV2.router02.abi,
      this.provider,
    );
  }

  getName(): Exchange {
    return Exchange.UNISWAP;
  }

  async getPrice(
    from: Cryptocurrency,
    to: Cryptocurrency,
    amount: string,
  ): Promise<string> {
    const result: ethers.BigNumber[] = await this.uniswapContract.getAmountsOut(
      amount,
      [from.address, to.address],
    );

    return result[1].toString();
  }
}
