import { ConfigModuleOptions } from '@nestjs/config'

export const configOption:ConfigModuleOptions={
    envFilePath:`.${process.env.NODE_ENV}.env`,
    isGlobal:true
}