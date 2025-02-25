import { DataSource } from 'typeorm'
import { dotenvConfig } from '@libs/configs/dotenv.config'
import { ConfigService } from '@nestjs/config'
import * as path from 'node:path'
import * as process from 'node:process'

require('dotenv').config(dotenvConfig)

const configService=new ConfigService()

export const appDataSource=new DataSource({
    type:'postgres',
    database:configService.getOrThrow<string>('POSTGRES_DB'),
    username:configService.getOrThrow<string>('POSTGRES_USERNAME'),
    password:configService.getOrThrow<string>('POSTGRES_PASSWORD'),
    port:Number(configService.getOrThrow<string>('POSTGRES_PORT')),
    migrations:[path.join(process.cwd(),'dist','migrations','**','*.{ts,js}')],
    entities:[path.join(process.cwd(),'dist','**','*.entity.{ts,js}')],
})