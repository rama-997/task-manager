import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseEnumPipe,
    ParseUUIDPipe,
    Patch,
    Post,
} from '@nestjs/common'
import { RoleService } from './role.service'
import { Role } from '@src/role/entities'
import { CreateRoleDto, UpdateRoleDto } from '@src/role/dto'
import { AuthDecorator } from '@libs/decorators'
import { ERoles } from '@src/role/types'
import { parseUUIDConfig } from '@libs/configs'
import { ApiExcludeController } from '@nestjs/swagger'

@Controller('role')
@AuthDecorator(ERoles.ADMIN)
@ApiExcludeController()
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    async create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
        return this.roleService.create(createRoleDto)
    }

    @Get(':value')
    async finOne(
        @Param('value', new ParseEnumPipe(ERoles)) value: ERoles,
    ): Promise<Role> {
        return this.roleService.findOne(value)
    }

    @Patch(':id')
    async update(
        @Param('id', new ParseUUIDPipe(parseUUIDConfig)) id: string,
        @Body() updateRoleDto: UpdateRoleDto,
    ): Promise<Role> {
        return this.roleService.update(id, updateRoleDto)
    }

    @Delete(':id')
    async delete(
        @Param('id', new ParseUUIDPipe(parseUUIDConfig)) id: string,
    ): Promise<Role> {
        return this.roleService.delete(id)
    }
}
