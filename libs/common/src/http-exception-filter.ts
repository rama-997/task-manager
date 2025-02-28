import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    UnauthorizedException,
    InternalServerErrorException,
    HttpException,
} from '@nestjs/common'
import { Response } from 'express'

@Catch(UnauthorizedException, InternalServerErrorException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const status = exception.getStatus()

        let message = 'Произошла ошибка' // Сообщение по умолчанию

        if (exception instanceof UnauthorizedException) {
            message = 'Доступ запрещен. Требуется авторизация.'
        } else if (exception instanceof InternalServerErrorException) {
            message = 'Внутренняя ошибка сервера. Попробуйте позже.'
        }

        response.status(status).json({
            statusCode: status,
            message,
        })
    }
}
