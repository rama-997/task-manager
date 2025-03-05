import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const UserAgent=createParamDecorator((data:unknown,context:ExecutionContext)=>{
    const req=context.switchToHttp().getRequest() as Request
    return req.headers['user-agent']
})