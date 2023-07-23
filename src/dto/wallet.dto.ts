// todo: validation of wallet dto
export declare interface Wallet {
    /**
     * Information about user's wallet's device.
     */
    device: DeviceInfo;
    /**
     * Provider type: http bridge or injected js.
     */
    provider: 'http' | 'injected';
    /**
     * Selected account.
     */
    account: Account;
    /**
     * Response for connect items request.
     */
    connectItems?: {
        tonProof?: TonProofItemReply;
    };
}

export declare interface DeviceInfo {
    platform: 'iphone' | 'ipad' | 'android' | 'windows' | 'mac' | 'linux' | 'browser';
    appName: string;
    appVersion: string;
    maxProtocolVersion: number;
    features: Feature[];
}

export declare type Feature =
    | SendTransactionFeatureDeprecated
    | SendTransactionFeature
    | SignDataFeature;

export declare type SendTransactionFeatureDeprecated = 'SendTransaction';

export declare type SendTransactionFeature = {
    name: 'SendTransaction';
    maxMessages: number;
};

export declare type SignDataFeature = {
    name: 'SignData';
};

export declare interface Account {
    /**
     * User's address in "hex" format: "<wc>:<hex>".
     */
    address: string;
    /**
     * User's selected chain.
     */
    chain: CHAIN;
    /**
     * Base64 (not url safe) encoded wallet contract stateInit.
     * Can be used to get user's public key from the stateInit if the wallet contract doesn't support corresponding get method.
     */
    walletStateInit: string;
    /**
     * Hex string without 0x prefix.
     */
    publicKey?: string;
}

export declare enum CHAIN {
    MAINNET = '-239',
    TESTNET = '-3',
}

export declare type TonProofItemReply = TonProofItemReplySuccess | TonProofItemReplyError;

export declare interface TonProofItemReplySuccess {
    name: 'ton_proof';
    proof: {
        timestamp: number;
        domain: {
            lengthBytes: number;
            value: string;
        };
        payload: string;
        signature: string;
    };
}

export declare type TonProofItemReplyError = ConnectItemReplyError<
    TonProofItemReplySuccess['name']
>;

export declare type ConnectItemReplyError<T> = {
    name: T;
    error: {
        code: CONNECT_ITEM_ERROR_CODES;
        message?: string;
    };
};

export declare enum CONNECT_ITEM_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    METHOD_NOT_SUPPORTED = 400,
}
