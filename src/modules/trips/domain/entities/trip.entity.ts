export class Trip {
  constructor(
    public readonly id: string | undefined,
    public readonly origin: string,
    public readonly destination: string,
    public readonly cost: number,
    public readonly duration: number,
    public readonly type: string,
    public readonly displayName: string,
    public readonly tripId?: string,
  ) {}
}
