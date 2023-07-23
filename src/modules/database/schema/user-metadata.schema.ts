import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FileMetadataDocument } from './file-metadata.schema';

export type UserMetadataDocument = HydratedDocument<UserMetadata>;

@Schema()
export class UserMetadata {
    @Prop({
        required: true,
        unique: true,
    })
    userId: string;

    @Prop({
        required: true,
        type: Map,
        of: Types.ObjectId,
        ref: 'FileMetadata',
    })
    bagIds: Map<string, FileMetadataDocument>;

    @Prop({
        required: true,
    })
    lastRawContentHash: string;

    @Prop({
        required: true,
    })
    lastBagId: string;

    @Prop({
        required: true,
    })
    lastUpdateTs: number;
}

export const UserMetadataSchema = SchemaFactory.createForClass(UserMetadata);
