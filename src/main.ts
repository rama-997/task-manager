import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { Logger, ValidationPipe } from '@nestjs/common'
import { HttpExceptionFilter } from '@libs/common'
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.useGlobalFilters(new HttpExceptionFilter())
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    app.setGlobalPrefix('api')

    app.use(cookieParser())

    const configService = app.get<ConfigService>(ConfigService)
    const PORT = configService.getOrThrow<string>('APP_PORT')

    const config = new DocumentBuilder()
        .setTitle('Task Manager')
        .setDescription('The task manager API description')
        .setVersion('1.0')
        .addBearerAuth()
        .build()
    const documentFactory = () => SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, documentFactory)

    await app.listen(Number(PORT))
    return PORT
}

bootstrap().then(PORT => {
    const logger = new Logger()
    logger.log(`listening on ${PORT}`)
})
