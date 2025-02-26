import { Module } from '@nestjs/common'
import { RoleModule } from './role/role.module'
import { ConfigModule } from '@nestjs/config'
import { configOption, typeormOption } from '@libs/options'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot(configOption),
        TypeOrmModule.forRootAsync(typeormOption),
        RoleModule,
        AuthModule,
        TokenModule,
        UserModule,
    ],
})
export class AppModule {}
