import { ethers } from 'ethers';
import { KybarswapRepository as KyberswapRepository } from './adapters/kyberswap/kyberswap_repository';
import { SushiswapRepository } from './adapters/sushiswap/sushiswap_repository';
import { UniswapRepository } from './adapters/uniswap/uniswap_repository';
import { Config } from './common/config';
import { BlockchainInteractor } from './interactors/blockchain_interactor';

async function bootstrap() {
  const config = new Config();
  const provider = new ethers.providers.JsonRpcProvider(config.infuraUrl);
  const uniswapRepository = new UniswapRepository(provider);

  const kyberswapRepository = new KyberswapRepository(provider);

  const sushiswapRepository = new SushiswapRepository(provider);

  const interactor = new BlockchainInteractor([
    uniswapRepository,
    kyberswapRepository,
    sushiswapRepository,
  ]);
  interactor.init();
  await new Promise((f) => setTimeout(f, 1000000));
  // const app = await NestFactory.create(AppModule);
  // await app.listen(3000);
}
bootstrap();
