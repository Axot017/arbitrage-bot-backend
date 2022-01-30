import { Cryptocurrency } from 'src/domain/cryptocurrency';
import { Exchange } from 'src/domain/exchange';

export interface ExchangeRepository {
  getPrice(
    from: Cryptocurrency,
    to: Cryptocurrency,
    amount: string,
  ): Promise<string>;

  getName(): Exchange;
}
