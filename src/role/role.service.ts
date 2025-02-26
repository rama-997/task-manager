import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Role } from '@src/role/entities'
import { Repository } from 'typeorm'
import { CreateRoleDto } from '@src/role/dto'

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    ) {}

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        const role=await this.roleRepo.findOneBy({value:createRoleDto.value})
        if(role){
            throw new ConflictException('Роль уже существует')
        }
        return this.roleRepo.save(createRoleDto)
    }
}
