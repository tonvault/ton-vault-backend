import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FileMetadataDocument = HydratedDocument<FileMetadata>;
export enum FileStatus {
    removed = 0,
    created = 1,
    payed = 2,
}

@Schema()
export class FileMetadata {
    @Prop({
        required: true,
    })
    createdTs: number;

    @Prop({
        required: true,
    })
    status: FileStatus;

    @Prop({
        required: true,
        unique: true,
    })
    rawContentHash: string;
}

export const FileMetadataSchema = SchemaFactory.createForClass(FileMetadata);
