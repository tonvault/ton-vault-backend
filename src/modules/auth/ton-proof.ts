import { createHash } from 'node:crypto';
import { Address } from 'ton';
import { signVerify } from 'ton-crypto';
import { AnswerCode } from '../../answer-code';
import { SignInDto } from '../../dto';

interface Domain {
    LengthBytes: number; // uint32 `json:"lengthBytes"`
    Value: string; // string `json:"value"`
}

interface ParsedMessage {
    Workchain: number; // int32
    Address: Buffer; // []byte
    Timestamp: number; // int64
    Domain: Domain; // Domain
    Signature: Buffer; // []byte
    Payload: string; // string
    StateInit: string; // string
}

const tonProofPrefix = 'ton-proof-item-v2/';
const tonConnectPrefix = 'ton-connect';

export function createMessage(message: ParsedMessage): Buffer {
    // wc := make([]byte, 4)
    // binary.BigEndian.PutUint32(wc, uint32(message.Workchain))

    const wc = Buffer.alloc(4);
    wc.writeUint32BE(message.Workchain);

    // ts := make([]byte, 8)
    // binary.LittleEndian.PutUint64(ts, uint64(message.Timstamp))

    const ts = Buffer.alloc(8);
    ts.writeBigUint64LE(BigInt(message.Timestamp));

    // dl := make([]byte, 4)
    // binary.LittleEndian.PutUint32(dl, message.Domain.LengthBytes)
    const dl = Buffer.alloc(4);
    dl.writeUint32LE(message.Domain.LengthBytes);

    const m = Buffer.concat([
        Buffer.from(tonProofPrefix),
        wc,
        message.Address,
        dl,
        Buffer.from(message.Domain.Value),
        ts,
        Buffer.from(message.Payload),
    ]);

    // const messageHash =  //sha256.Sum256(m)
    // const messageHash = await crypto.subtle.digest('SHA-256', m)
    // const m = Buffer.from(tonProofPrefix)
    // m.write(ts)

    // m := []byte(tonProofPrefix)
    // m = append(m, wc...)
    // m = append(m, message.Address...)
    // m = append(m, dl...)
    // m = append(m, []byte(message.Domain.Value)...)
    // m = append(m, ts...)
    // m = append(m, []byte(message.Payload)...)

    const messageHash = createHash('sha256').update(m).digest();

    const fullMes = Buffer.concat([
        Buffer.from([0xff, 0xff]),
        Buffer.from(tonConnectPrefix),
        Buffer.from(messageHash),
    ]);
    // []byte{0xff, 0xff}
    // fullMes = append(fullMes, []byte(tonConnectPrefix)...)
    // fullMes = append(fullMes, messageHash[:]...)

    // const res = await crypto.subtle.digest('SHA-256', fullMes)
    const res = createHash('sha256').update(fullMes).digest();
    return Buffer.from(res);
}

export function convertTonProofMessage(signInDto: SignInDto): ParsedMessage {
    const address = Address.parse(signInDto.addressRaw);
    const proof = signInDto.tonProof.proof;

    const res: ParsedMessage = {
        Workchain: address.workChain,
        Address: address.hash,
        Domain: {
            LengthBytes: proof.domain.lengthBytes,
            Value: proof.domain.value,
        },
        Signature: Buffer.from(proof.signature, 'base64'),
        Payload: proof.payload,
        StateInit: signInDto.walletStateInit,
        Timestamp: proof.timestamp,
    };
    return res;
}

// todo: false reason
export function signatureVerify(signInDto: SignInDto, lifetime: number): AnswerCode {
    const tonProof = signInDto.tonProof.proof;
    if (!tonProof) {
        return AnswerCode.TonProofDoesNotExist;
    }
    const pubkey = signInDto.publicKey;
    if (!pubkey) {
        return AnswerCode.TonProofNoPubKey;
    }

    const parsedMessage = convertTonProofMessage(signInDto);

    if (Date.now() - parsedMessage.Timestamp * 1000 > lifetime) {
        return AnswerCode.TonProofExpired;
    }
    const checkMessage = createMessage(parsedMessage);

    const result = signVerify(checkMessage, parsedMessage.Signature, Buffer.from(pubkey, 'hex'));
    return result ? AnswerCode.success : AnswerCode.TonProofInvalidSignature;
}
