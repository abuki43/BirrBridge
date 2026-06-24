export interface AlchemyActivity {
  category: string;
  asset: string;
  hash: string;
  fromAddress: string;
  toAddress: string;
  blockNum: string;
  rawContract: {
    address: string;
    rawValue: string;
  };
  removed?: boolean;
  log?: {
    removed?: boolean;
  };
}
