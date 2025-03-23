import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Role } from '@src/role/entities'
import { Repository } from 'typeorm'
import { CreateRoleDto, UpdateRoleDto } from '@src/role/dto'
import { ERoles } from '@src/role/types'

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    ) {}

    async create(createRoleDto: CreateRoleDto): Promise<Role | null> {
        return await this.roleRepo.findOneBy({ value: createRoleDto.value })
    }

    async findOne(value: ERoles): Promise<Role> {
        const role = await this.roleRepo.findOneBy({ value })
        if (!role) {
            throw new NotFoundException('Нет роли')
        }
        return role
    }

    async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
        let role = await this.roleRepo.findOneBy({ id })
        if (!role) {
            throw new NotFoundException('Нет роли')
        }
        return this.roleRepo.save(Object.assign(role, updateRoleDto))
    }

    async delete(id: string): Promise<Role> {
        return this.roleRepo.delete(id).then(res => res.raw)
    }
}
