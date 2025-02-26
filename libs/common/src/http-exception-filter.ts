import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException, HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()
        const status = exception.getStatus()

        if(status===HttpStatus.UNAUTHORIZED) {
            response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                message:'Пользователь не авторизован. Пожалуйста, авторизуйтесь.',
            })
        }
        if(status===HttpStatus.INTERNAL_SERVER_ERROR) {
            response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                message:'Упс, что-то пошло не так.',
            })
        }
    }
}
