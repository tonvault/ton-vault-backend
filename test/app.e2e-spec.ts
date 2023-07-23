import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TonVaultModule } from '../src/modules/ton-vault/ton-vault.module';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../src/config/env.validation';
import { CreateFileDto, FileDto } from '../src/dto';
import { KeyPair, mnemonicToPrivateKey, sha256, sign } from 'ton-crypto';
import * as crypto from 'crypto';
import { decryptContent, encryptContent, generateAesKey } from '../src/utils/crypto';
import { AnswerCode } from '../src/answer-code';
import { SignInDto } from '../src/dto';

// todo: fix authorization part of the test
describe('Ton Vault Backend (e2e)', () => {
    let app: INestApplication;
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
    let jwtToken: string;

    const bootstrap = async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [TonVaultModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        const configService: ConfigService<EnvironmentVariables> = app.get(ConfigService);
        app.setGlobalPrefix(configService.get('GLOBAL_PREFIX'));
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        );
        await app.init();
    };

    beforeAll(async () => {
        keyPair = await mnemonicToPrivateKey(testMnemonic);
        await bootstrap();

        /* Authorization */
        const { text: reqString } = await request(app.getHttpServer()).get(
            `/api/auth/request/${keyPair.publicKey.toString('hex')}`,
        );

        const signInDto: SignInDto = {
            publicKey: keyPair.publicKey.toString('hex'),
            signature: sign(Buffer.from(reqString, 'utf8'), keyPair.secretKey).toString('hex'),
        };
        const { body: jwt } = await request(app.getHttpServer()).post('/api/auth/login').send(signInDto);
        jwtToken = jwt.access_token;
    });

    it('/api/health', async () => {
        const req = await request(app.getHttpServer()).get('/api/health');
        expect(req.status).toBe(200);
    });

    it('api/ton-vault/create', async () => {
        const content = crypto.randomBytes(100).toString('base64');
        const rawContentHash = (await sha256(content)).toString('hex');

        const aesKey = await generateAesKey(keyPair.secretKey, rawContentHash);
        const createFileDto: CreateFileDto = {
            publicKey: keyPair.publicKey.toString('hex'),
            rawContentHash,
            encryptedContent: encryptContent(aesKey, content),
            secondEncryptKey: (await sha256(aesKey)).toString('hex'),
        };

        const wrongReq = await request(app.getHttpServer())
            .post('/api/create')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                publicKey: '0x1234567890abcdef',
            });
        expect(wrongReq.status).toBe(400);

        const req = await request(app.getHttpServer())
            .post('/api/create')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(createFileDto);
        expect(req.status).toBe(201);
        expect(req.body.code).toBe(AnswerCode.success);

        const repReq = await request(app.getHttpServer())
            .post('/api/create')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(createFileDto);
        expect(repReq.status).toBe(201);
        expect(repReq.body.code).toBe(AnswerCode.fileAlreadyExist);
        expect(repReq.body.result).toEqual(req.body.result);
    });

    it('api/get', async () => {
        const req = await request(app.getHttpServer())
            .get(`/api/get/${keyPair.publicKey.toString('hex')}`)
            .set('Authorization', `Bearer ${jwtToken}`);
        expect(req.status).toBe(200);
        expect(req.body.code).toBe(AnswerCode.success);
    });

    it('encrypt decrypt cycle', async () => {
        const content = 'Very Important Users Content';
        const contentBase64 = Buffer.from(content).toString('base64');
        const rawContentHash = (await sha256(contentBase64)).toString('hex');
        const aesKey = await generateAesKey(keyPair.secretKey, rawContentHash);
        const secondEncryptKey = await sha256(aesKey);
        const createFileDto: CreateFileDto = {
            publicKey: keyPair.publicKey.toString('hex'),
            rawContentHash,
            encryptedContent: encryptContent(aesKey, contentBase64),
            secondEncryptKey: secondEncryptKey.toString('hex'),
        };

        await request(app.getHttpServer())
            .post('/api/create')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(createFileDto);

        const fileDto: FileDto = (
            await request(app.getHttpServer())
                .get(`/api/get/${keyPair.publicKey.toString('hex')}`)
                .set('Authorization', `Bearer ${jwtToken}`)
        ).body.result;
        const encryptedContent = fileDto.content;

        const decryptedContent = Buffer.from(
            decryptContent(aesKey, decryptContent(secondEncryptKey, encryptedContent)),
            'base64',
        ).toString('utf8');
        expect(decryptedContent).toEqual(content);
    });

    afterAll(async () => {
        await app.close();
    });
});
