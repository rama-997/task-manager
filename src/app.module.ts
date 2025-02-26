import { Module } from '@nestjs/common'
import { RoleModule } from './role/role.module'
import { ConfigModule } from '@nestjs/config'
import { configOption, typeormOption } from '@libs/options'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot(configOption),
        TypeOrmModule.forRootAsync(typeormOption),
        RoleModule,
        AuthModule,
    ],
})
export class AppModule {}
