import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const Cookie = createParamDecorator(
    (_:unknown, context: ExecutionContext) => {
        const req=context.switchToHttp().getRequest() as Request
        return req.cookies
    },
)
