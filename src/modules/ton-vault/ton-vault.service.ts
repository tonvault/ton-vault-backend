import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    FileMetadata,
    FileMetadataDocument,
    UserMetadata,
    UserMetadataDocument,
} from '../database/schema';
import { Model } from 'mongoose';
import { TonStorageCliService } from '../ton-storage-cli/ton-storage-cli.service';
import {
    CreateFileDto,
    CreateFileResultDto,
    FileDto,
    GeneralApiAnswerDto,
    JwtPayloadDto,
} from '../../dto';
import { encryptContent } from '../../utils/crypto';
import { FileStatus } from '../database/schema/file-metadata.schema';
import { AnswerCode } from '../../answer-code';

@Injectable()
export class TonVaultService {
    private readonly logger: Logger;
    constructor(
        @InjectModel(UserMetadata.name) private readonly userMetadataModel: Model<UserMetadata>,
        @InjectModel(FileMetadata.name) private readonly fileMetadataModel: Model<FileMetadata>,
        private readonly tonStorageCliService: TonStorageCliService,
    ) {
        this.logger = new Logger(TonVaultService.name);
    }

    async getLastUserFile(publicKey: string): Promise<GeneralApiAnswerDto<FileDto | string>> {
        const userId = this.tonStorageCliService.getUserId(publicKey);
        const metadata = await this.getUserMetadata(userId);
        const lastBagId = metadata?.lastBagId;
        if (!metadata || !lastBagId) {
            return {
                result: 'No files available',
                code: AnswerCode.TonStorageFilesNotFound,
            };
        }
        const fileMetadata: FileMetadataDocument = metadata.bagIds.get(lastBagId);
        if (fileMetadata.status === FileStatus.removed) {
            return {
                result: 'File has been removed',
                code: AnswerCode.TonStorageRemovedFile,
            };
        }
        return {
            result: {
                content: await this.tonStorageCliService.getFileContent(lastBagId, publicKey),
                bagId: lastBagId,
                rawContentHash: fileMetadata.rawContentHash,
            },
            code: AnswerCode.success,
        };
    }

    // todo: authorization procedure
    async createFile(
        { rawContentHash, encryptedContent, secondEncryptKey }: CreateFileDto,
        { pub: publicKey }: JwtPayloadDto,
    ): Promise<GeneralApiAnswerDto<CreateFileResultDto | string>> {
        const userId = this.tonStorageCliService.getUserId(publicKey);
        const metadata = await this.getUserMetadata(userId);
        if (metadata?.lastRawContentHash === rawContentHash) {
            return {
                result: metadata.lastBagId,
                code: AnswerCode.TonStorageFileAlreadyExist,
            };
        }
        const { code, result } = await this.tonStorageCliService.createTorrent(
            encryptContent(Buffer.from(secondEncryptKey, 'hex'), encryptedContent),
            publicKey,
        );
        if (code !== AnswerCode.TonStorageFileAlreadyExist && code !== AnswerCode.success) {
            throw new InternalServerErrorException(result);
        }
        if (metadata) {
            await this.updateMetadata(rawContentHash, result as string, userId);
        } else {
            await this.createMetadata(rawContentHash, result as string, userId);
        }
        return {
            result,
            code,
        };
    }

    private async updateMetadata(
        rawContentHash: string,
        bagId: string,
        userId: string,
    ): Promise<void> {
        const promises = [];
        const now = Date.now();

        let fileMetadata = await this.getFileMetadata(rawContentHash);
        if (!fileMetadata) {
            fileMetadata = new this.fileMetadataModel({
                createdTs: now,
                rawContentHash,
                status: FileStatus.created,
            });
            promises.push(fileMetadata.save());
        }
        promises.push(
            this.userMetadataModel.updateOne(
                {
                    userId,
                },
                {
                    lastBagId: bagId,
                    lastUpdateTs: now,
                    lastRawContentHash: rawContentHash,
                    $set: {
                        [`bagIds.${bagId}`]: fileMetadata._id,
                    },
                },
            ),
        );
        await Promise.all(promises);
    }

    private async createMetadata(
        rawContentHash: string,
        bagId: string,
        userId: string,
    ): Promise<void> {
        const promises = [];
        const now = Date.now();

        let fileMetadata = await this.getFileMetadata(rawContentHash);
        if (!fileMetadata) {
            fileMetadata = new this.fileMetadataModel({
                createdTs: now,
                rawContentHash,
                status: FileStatus.created,
            });
            promises.push(fileMetadata.save());
        }

        const userMetadata = new this.userMetadataModel({
            userId,
            lastBagId: bagId,
            lastUpdateTs: now,
            bagIds: {
                [bagId]: fileMetadata._id,
            },
            lastRawContentHash: rawContentHash,
        });
        promises.push(userMetadata.save());

        await Promise.all(promises);
    }

    private async getFileMetadata(rawContentHash: string): Promise<FileMetadataDocument | null> {
        return this.fileMetadataModel.findOne({
            rawContentHash,
        });
    }

    private async getUserMetadata(userId: string): Promise<UserMetadataDocument | null> {
        return this.userMetadataModel
            .findOne({
                userId,
            })
            .populate({
                path: 'bagIds',
                model: this.fileMetadataModel,
            });
    }
}
