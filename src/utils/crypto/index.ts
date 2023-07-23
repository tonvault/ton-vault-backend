import { sha256, sign } from 'ton-crypto';
import * as crypto from 'node:crypto';

const keyGenerationMessage = (contentHash: string) =>
    `-- TON-VAULT SERVICE SIGNATURE GENERATION --\n${contentHash}`;

const generateAesKey = async (privateKey: Buffer, contentHash: string): Promise<Buffer> => {
    return sha256(sign(Buffer.from(keyGenerationMessage(contentHash)), privateKey));
};

const encryptContent = (aesKey: Buffer, content: string) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, new Uint8Array(16));
    cipher.setEncoding('base64');
    return cipher.update(content, 'base64', 'base64') + cipher.final('base64');
};

const decryptContent = (aesKey: Buffer, encryptedContent: string) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, new Uint8Array(16));
    decipher.setEncoding('base64');
    return decipher.update(encryptedContent, 'base64', 'base64') + decipher.final('base64');
};

export { keyGenerationMessage, generateAesKey, encryptContent, decryptContent };
