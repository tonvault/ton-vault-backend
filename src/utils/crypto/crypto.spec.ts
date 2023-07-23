import { KeyPair, mnemonicToPrivateKey, sha256 } from 'ton-crypto';
import { decryptContent, encryptContent, generateAesKey } from './index';
import * as crypto from 'crypto';

describe('TonVault Crypto', () => {
    const testMnemonic = [
        'fiction',
        'good',
        'butter',
        'tomorrow',
        'panda',
        'december',
        'gather',
        'bitter',
        'eagle',
        'chase',
        'either',
        'gas',
        'course',
        'bunker',
        'casino',
        'attitude',
        'name',
        'stem',
        'rebuild',
        'dinner',
        'write',
        'skate',
        'vintage',
        'silly',
    ];
    let keyPair: KeyPair;
    beforeAll(async () => {
        keyPair = await mnemonicToPrivateKey(testMnemonic);
    });

    it('should encrypt and decrypt user data', async () => {
        const content = 'test user content';
        const base64Content = Buffer.from(content, 'utf8').toString('base64');
        const contentHash = (await sha256(base64Content)).toString('hex');

        //encryption
        let aesKey = await generateAesKey(keyPair.secretKey, contentHash);
        const encryptedContent = encryptContent(aesKey, base64Content);

        // decryption
        aesKey = await generateAesKey(keyPair.secretKey, contentHash);
        const decryptedContent = decryptContent(aesKey, encryptedContent);
        expect(Buffer.from(decryptedContent, 'base64').toString('utf8')).toEqual(content);
    });

    it('should generate the same aes key for the same data', async () => {
        const tries = 10;
        const content = 'dummy content';
        const contentHash = (await sha256(content)).toString('hex');
        let aesKey = await generateAesKey(keyPair.secretKey, contentHash);
        for (let i = 0; i < tries; i++) {
            const tmp = await generateAesKey(keyPair.secretKey, contentHash);
            expect(tmp).toEqual(aesKey);
            aesKey = tmp;
        }
    });

    it('should generate different aes keys for different data', async () => {
        const tries = 10;
        const contentHash = await sha256(crypto.randomBytes(32).toString('hex'));
        let aesKey = await generateAesKey(keyPair.secretKey, contentHash.toString('hex'));
        for (let i = 0; i < tries; i++) {
            const contentHash = await sha256(crypto.randomBytes(32).toString('hex'));
            const tmp = await generateAesKey(keyPair.secretKey, contentHash.toString('hex'));
            expect(tmp).not.toEqual(aesKey);
            aesKey = tmp;
        }
    });
});
