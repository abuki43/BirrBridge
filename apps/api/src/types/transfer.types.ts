export interface TransferInput {
  senderDbUserId: string;
  senderPrivyUserId: string;
  to: string;
  amount: string;
  note?: string;
  userJwt: string;
}
