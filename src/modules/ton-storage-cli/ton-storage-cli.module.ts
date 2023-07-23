import { DynamicModule, Module } from '@nestjs/common';
import { TonStorageCliService } from './ton-storage-cli.service';
import { TonStorageCliOptionsInterface } from '../../interface';

@Module({
    providers: [TonStorageCliService],
    exports: [TonStorageCliService],
})
export class TonStorageCliModule {
    static forRoot(options: TonStorageCliOptionsInterface): DynamicModule {
        return {
            module: TonStorageCliModule,
            providers: [
                {
                    useValue: options,
                    provide: 'OPTIONS',
                },
            ],
        };
    }

    static forRootAsync(asyncOptions): DynamicModule {
        return {
            module: TonStorageCliModule,
            imports: asyncOptions.imports,
            providers: [
                {
                    provide: 'OPTIONS',
                    useFactory: asyncOptions.useFactory,
                    inject: asyncOptions.inject,
                },
            ],
            global: true,
        };
    }
}
