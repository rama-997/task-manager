import { Module } from '@nestjs/common'
import { RoleModule } from './role/role.module'
import { ConfigModule } from '@nestjs/config'
import { configOption, typeormOption } from '@libs/options'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
    imports: [
        ConfigModule.forRoot(configOption),
        TypeOrmModule.forRootAsync(typeormOption),
        RoleModule,
    ],
})
export class AppModule {}
