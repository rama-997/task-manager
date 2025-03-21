import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const UserId = createParamDecorator(
    (_: unknown, context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest() as Request
        return req.user!['id']
    },
)