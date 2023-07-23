import { Inject, Injectable } from '@nestjs/common';
import * as TonStorageCLi from 'tonstorage-cli';
import { TonStorageCliOptionsInterface } from '../../interface';
import * as fsAsync from 'node:fs/promises';
import { fileExists } from '../../utils/helper';
import { CreateFileResultDto, GeneralStorageAnswerDto } from '../../dto';
import { BagId } from '../../interface';
import { AnswerCode } from '../../answer-code';

@Injectable()
export class TonStorageCliService extends TonStorageCLi {
    readonly filesDir: string;
    readonly maxContentSize: number;
    constructor(@Inject('OPTIONS') options: TonStorageCliOptionsInterface) {
        super({
            bin: options.bin,
            host: options.host,
            database: options.database,
            timeout: options.timeout,
        });
        this.filesDir = options.filesDir;
        this.maxContentSize = options.maxContentSizeBytes ?? 1024 * 5;
        fileExists(this.filesDir).then((exist) => {
            if (!exist) {
                fsAsync.mkdir(this.filesDir);
            }
        });
    }

    getTorrentPath(bagId: BagId, userId: string) {
        return `${this.filesDir}/../${bagId}/${userId}`;
    }

    getLastContentPath(userId: string) {
        return `${this.filesDir}/${userId}`;
    }

    getUserId(pubKey: string) {
        if (pubKey.slice(0, 2) === '0x' || pubKey.slice(0, 2) === '0X') {
            return pubKey.slice(2).toUpperCase();
        } else {
            return pubKey.toUpperCase();
        }
    }

    async get(bagId: BagId) {
        // todo: wrap
        return super.get(bagId);
    }

    async getMeta(bagId: BagId) {
        // todo: wrap
        return super.getMeta(bagId);
    }

    async getPeers(bagId: BagId) {
        // todo: wrap
        return super.getPeers(bagId);
    }

    async list() {
        // todo: wrap
        return super.list();
    }

    async getFileContent(bagId: BagId, pubKey: string): Promise<string | null> {
        const torrentPath = this.getTorrentPath(bagId, this.getUserId(pubKey));
        const torrentExist = await fileExists(torrentPath);
        if (!torrentExist) {
            return null;
        }
        const torrent = await fsAsync.readFile(torrentPath);
        return torrent.toString('base64');
    }

    async createTorrent(
        content: string,
        pubKey: string,
    ): Promise<GeneralStorageAnswerDto<CreateFileResultDto | BagId>> {
        const userId = this.getUserId(pubKey);
        const lastContentPath = this.getLastContentPath(userId);
        await fsAsync.writeFile(lastContentPath, Buffer.from(content, 'base64'), {
            encoding: 'binary',
        });

        const result: GeneralStorageAnswerDto<CreateFileResultDto> = await super.create(
            lastContentPath,
            {
                copy: true,
                upload: true,
            },
        );
        if (result.code === 0) {
            return {
                result: Buffer.from(result.result.torrent.hash, 'base64')
                    .toString('hex')
                    .toUpperCase(),
                code: 0,
                ok: true,
            };
        } else if (result.code === 400 && /duplicate hash/i.test(result.error)) {
            return {
                code: AnswerCode.TonStorageFileAlreadyExist,
                ok: false,
                error: result.error,
                result: result.error.split(' ').at(-1).toUpperCase(),
            };
        }
        return result;
    }

    async removeTorrent(bagId: BagId, pubKey: string, removeFiles?: boolean): Promise<boolean> {
        const torrentPath = this.getTorrentPath(bagId, this.getUserId(pubKey));
        const torrentExist = await fileExists(torrentPath);
        if (!torrentExist) {
            return false;
        }
        await super.remove(bagId, { removeFiles });
        return true;
    }
}
