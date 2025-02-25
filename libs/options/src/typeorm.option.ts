import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'
import { appDataSource } from '@libs/configs'

export const typeormOption: TypeOrmModuleAsyncOptions = {
    useFactory: () => ({
        ...appDataSource.options,
        autoLoadEntities:true
    })
}