import { Cryptocurrency } from 'src/domain/cryptocurrency';
import { ethers } from 'ethers';
import { ExchangeRepository } from 'src/interactors/ports/exchnge_repository';
import { Exchange } from 'src/domain/exchange';

const KYBERSWAP_FACTORY_ADDRESS = '0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE';
const KYBERSWAP_ROUTER_ADDRESS = '0x1c87257f5e8609940bc751a07bb085bb7f8cdbe6';
const INVALID_POOL_ADDRESS = '0x0000000000000000000000000000000000000000';

export class KybarswapRepository implements ExchangeRepository {
  readonly kyberFactoryContract: ethers.Contract;
  readonly kyberRouterContract: ethers.Contract;

  constructor(private readonly provider: ethers.providers.JsonRpcProvider) {
    this.kyberFactoryContract = new ethers.Contract(
      KYBERSWAP_FACTORY_ADDRESS,
      [
        'function getUnamplifiedPool(address token0, address token1) external view returns (address)',
        'function isPool(address token0, address token1, address pool) external view returns (bool)',
        'function getPools(address token0, address token1) external view returns (address[] memory _tokenPools)',
      ],
      provider,
    );
    this.kyberRouterContract = new ethers.Contract(
      KYBERSWAP_ROUTER_ADDRESS,
      [
        'function getAmountsOut(uint256 amountIn, address[] memory poolsPath, address[] memory path) external view returns (uint256[] memory amounts)',
      ],
      provider,
    );
  }
  getName(): Exchange {
    return Exchange.KYBERSWAP;
  }

  async getPrice(
    from: Cryptocurrency,
    to: Cryptocurrency,
    amount: string,
  ): Promise<string> {
    const pool = await this.kyberFactoryContract.getUnamplifiedPool(
      from.address,
      to.address,
    );
    if (pool.toString() === INVALID_POOL_ADDRESS) {
      throw Error('Invalid pool');
    }
    const result = await this.kyberRouterContract.getAmountsOut(
      amount,
      [pool],
      [from.address, to.address],
    );

    return result[1].toString();
  }
}
