import { Module } from '@nestjs/common'
import { RoleModule } from './role/role.module'
import { ConfigModule } from '@nestjs/config'
import { configOption } from '@libs/options'

@Module({
    imports: [ConfigModule.forRoot(configOption), RoleModule],
})
export class AppModule {
}
