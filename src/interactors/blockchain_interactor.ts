import { Cryptocurrency } from 'src/domain/cryptocurrency';
import { JSBI } from 'src/utils/jsbi';
import { BASE_CRYPTOS } from './base_cryptos';
import { ExchangeRepository } from './ports/exchnge_repository';
import { SUPPORTED_CRYPTOS } from './supported_cryptos';

const ONE_ETHER = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18));
const ETH = new Cryptocurrency(
  1,
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  18,
  'WETH',
);

export class BlockchainInteractor {
  constructor(private readonly exchangeRepositories: ExchangeRepository[]) {}

  init() {
    this.checkPrices();
  }

  private checkPrices = async (): Promise<void> => {
    const promises: Promise<void>[] = [];
    for (let i = 0; i < this.exchangeRepositories.length; i++) {
      const exchangeFrom = this.exchangeRepositories[i];
      for (let j = 0; j < this.exchangeRepositories.length; j++) {
        if (i == j) continue;
        const exchangeTo = this.exchangeRepositories[j];
        promises.push(this.compareForExchanges(exchangeFrom, exchangeTo));
      }
    }

    await Promise.all(promises);

    this.checkPrices();
  };

  private async compareForExchanges(
    exchangeFrom: ExchangeRepository,
    exchangeTo: ExchangeRepository,
  ) {
    for (let i = 0; i < BASE_CRYPTOS.length; i++) {
      const from = BASE_CRYPTOS[i];
      for (let j = 0; j < SUPPORTED_CRYPTOS.length; j++) {
        const to = SUPPORTED_CRYPTOS[j];
        if (from.address == to.address) continue;
        await this.compare(exchangeFrom, exchangeTo, from, to);
      }
    }
  }

  private async compare(
    exchangeFrom: ExchangeRepository,
    exchangeTo: ExchangeRepository,
    from: Cryptocurrency,
    to: Cryptocurrency,
  ) {
    try {
      const baseAmount =
        from.address !== ETH.address
          ? await exchangeFrom.getPrice(ETH, from, ONE_ETHER.toString())
          : ONE_ETHER.toString();

      const result1 = JSBI.BigInt(
        await exchangeFrom.getPrice(from, to, baseAmount),
      );
      const result2 = JSBI.BigInt(
        await exchangeTo.getPrice(to, from, result1.toString()),
      );

      if (
        JSBI.equal(result1, JSBI.BigInt('0')) ||
        JSBI.equal(result2, JSBI.BigInt('0'))
      )
        return;
      const mark = JSBI.lessThan(JSBI.BigInt(baseAmount), result2)
        ? '---> '
        : '';
      const cryptos = [from.symbol, to.symbol].join(' - ');
      const exchanges = [exchangeFrom.getName(), exchangeTo.getName()].join(
        ' - ',
      );

      console.log(`${mark}${cryptos} (${exchanges})`);
    } catch (e) {}
  }
}
