import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common'
import { RoleService } from './role.service'
import { Role } from '@src/role/entities'
import { CreateRoleDto, UpdateRoleDto } from '@src/role/dto'
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

    @Get(':id')
    async finOne(@Param('id') id: string): Promise<Role> {
        return this.roleService.findOne(id)
    }

    @Patch(':id')
    async update(@Param('id', new ParseUUIDPipe()) id:string,@Body() updateRoleDto:UpdateRoleDto):Promise<Role>{
        return this.roleService.update(id, updateRoleDto)
    }
}
