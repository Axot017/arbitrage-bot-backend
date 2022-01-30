export class Cryptocurrency {
  constructor(
    public readonly chainId: number,
    public readonly address: string,
    public readonly decimals: number,
    public readonly symbol?: string,
    public readonly name?: string,
  ) {}
}
