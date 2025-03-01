import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Role } from '@src/role/entities'
import { Repository } from 'typeorm'
import { CreateRoleDto, UpdateRoleDto } from '@src/role/dto'

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

    async findOne(id: string): Promise<Role> {
        const role=await this.roleRepo.findOneBy({id})
        if(!role){
            throw new NotFoundException('Нет роли')
        }
        return role
    }

    async update(id:string, updateRoleDto:UpdateRoleDto):Promise<Role>{
        let role=await this.roleRepo.findOneBy({id})
        if(!role){
            throw new NotFoundException('Нет роли')
        }
        return this.roleRepo.save(Object.assign(role,updateRoleDto))

    }

    async delete(id:string):Promise<Role>{
        return this.roleRepo.delete(id).then(res=>res.raw)
    }
}
