import { TonProofItemReplySuccess } from './wallet.dto';

export interface SignInDto {
    publicKey: string;
    addressRaw: string;
    walletStateInit: string;
    tonProof: TonProofItemReplySuccess;
}
