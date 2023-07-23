import { plainToInstance, Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min, validateSync } from 'class-validator';

enum Environment {
    PROD = 'PROD',
    STAGE = 'STAGE',
    LOCAL = 'LOCAL',
}

export class EnvironmentVariables {
    @IsEnum(Environment)
    ENV: Environment;

    @IsNumber()
    PORT: number;

    @IsString()
    @Transform(({ value }) => value || 'api')
    GLOBAL_PREFIX: string;

    @IsNumber()
    @Min(1_000)
    @Transform(({ value }) => value || 1_000)
    CREATE_FILE_THROTTLE_TIME: number;

    @IsString()
    @IsNotEmpty()
    MONGO_URI: string;

    @IsString()
    @IsNotEmpty()
    DATABASE: string;

    @IsString()
    @IsNotEmpty()
    STORAGE_BIN: string;

    @IsString()
    @IsNotEmpty()
    STORAGE_HOST: string;

    @IsString()
    @IsNotEmpty()
    STORAGE_DATABASE: string;

    @IsString()
    @IsNotEmpty()
    STORAGE_FILES_DIR: string;

    @IsNumber()
    @Min(1_000)
    @Transform(({ value }) => value || 5_000)
    STORAGE_TIMEOUT: number;

    @IsString()
    @IsNotEmpty()
    JWT_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
}
