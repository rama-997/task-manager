import { Body, Controller, Post } from '@nestjs/common'
import { RoleService } from './role.service'
import { Role } from '@src/role/entities'
import { CreateRoleDto } from '@src/role/dto'
import { AuthDecorator } from '@libs/decorators'
import { ERoles } from '@src/role/types'

@Controller('role')
@AuthDecorator(ERoles.ADMIN)
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    async create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
        return this.roleService.create(createRoleDto)
    }
}
