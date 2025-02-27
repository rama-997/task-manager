import { ERoles } from '@src/role/types'
import { applyDecorators, UseGuards } from '@nestjs/common'
import { JwtGuard, RoleGuard } from '@src/auth/guards'
import { RoleDecorator } from '@libs/decorators/role.decorator'

export const AuthDecorator=(...roles:ERoles[])=>{
    if(!roles.length){
        return applyDecorators(UseGuards(JwtGuard))
    }
    return applyDecorators(RoleDecorator(...roles),UseGuards(JwtGuard,RoleGuard))
}