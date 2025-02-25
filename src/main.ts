import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const configService = app.get<ConfigService>(ConfigService)
    const PORT = configService.getOrThrow<string>('APP_PORT')
    await
        app.listen(Number(PORT))
    return PORT
}

bootstrap().then(PORT=>{
    const logger=new Logger()
    logger.log(`listening on ${PORT}`)
})
