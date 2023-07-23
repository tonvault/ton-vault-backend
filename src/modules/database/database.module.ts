import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../config/env.validation';
import { FileMetadata, FileMetadataSchema, UserMetadata, UserMetadataSchema } from './schema';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
                uri: configService.get<string>('MONGO_URI'),
                connectTimeoutMS: configService.get('STORAGE_TIMEOUT'),
                dbName: configService.get('DATABASE'),
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([
            {
                name: UserMetadata.name,
                schema: UserMetadataSchema,
            },
            {
                name: FileMetadata.name,
                schema: FileMetadataSchema,
            },
        ]),
    ],
    exports: [MongooseModule],
})
export class DatabaseModule {}
