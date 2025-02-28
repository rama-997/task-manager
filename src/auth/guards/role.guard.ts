import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { Reflector } from '@nestjs/core'
import { ERoles } from '@src/role/types'
import { ROLE_KEY } from '@libs/decorators'

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest()
        const roles = this.reflector.getAllAndOverride<ERoles[]>(ROLE_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if (!roles.length) return true

        const isRight = roles.some(role => request.user.roles?.includes(role))

        if (!isRight) {
            throw new ForbiddenException(
                `Недостаточно прав. Пожалуйста, обратитесь в тех поддержку.`,
            )
        }

        return true
    }
}
