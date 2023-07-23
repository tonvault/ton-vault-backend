import { Module } from '@nestjs/common';
import { TonVaultController } from './ton-vault.controller';
import { TonVaultService } from './ton-vault.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables, validate } from '../../config/env.validation';
import { DatabaseModule } from '../database/database.module';
import { TonStorageCliModule } from '../ton-storage-cli/ton-storage-cli.module';
import { TonStorageCliOptionsInterface } from '../../interface';
import { HealthModule } from '../health/health.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            validate,
            isGlobal: true,
        }),
        TonStorageCliModule.forRootAsync({
            useFactory: (
                configService: ConfigService<EnvironmentVariables>,
            ): TonStorageCliOptionsInterface => ({
                bin: configService.get('STORAGE_BIN'),
                database: configService.get('STORAGE_DATABASE'),
                host: configService.get('STORAGE_HOST'),
                filesDir: configService.get('STORAGE_FILES_DIR'),
                timeout: configService.get('STORAGE_TIMEOUT'),
            }),
            inject: [ConfigService],
        }),
        DatabaseModule,
        HealthModule,
        AuthModule,
    ],
    controllers: [TonVaultController],
    providers: [TonVaultService],
})
export class TonVaultModule {}
