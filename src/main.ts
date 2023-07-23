import { NestFactory } from '@nestjs/core';
import { TonVaultModule } from './modules/ton-vault/ton-vault.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { EnvironmentVariables } from './config/env.validation';

async function bootstrap() {
    const app = await NestFactory.create(TonVaultModule);
    const configService: ConfigService<EnvironmentVariables> = app.get(ConfigService);
    app.setGlobalPrefix(configService.get('GLOBAL_PREFIX'));
    // todo: forbid cors
    app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    await app.listen(configService.get('PORT'));
}

bootstrap().then(() => {
    console.log(`*** APPLICATION SUCCESSFULLY BOOTSTRAPPED ${new Date()} ***`);
});
