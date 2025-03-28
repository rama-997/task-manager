import { Test, TestingModule } from '@nestjs/testing'
import { RoleService } from './role.service'
import { Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Role } from '@src/role/entities'
import { CreateRoleDto, UpdateRoleDto } from '@src/role/dto'
import { createRoleDtoMock, roleMock, updateRoleDtoMock } from '@src/role/mocks'
import { ConflictException, NotFoundException } from '@nestjs/common'

describe('RoleService', () => {
    let service: RoleService
    let roleRepo: Repository<Role>

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoleService,
                { provide: getRepositoryToken(Role), useClass: Repository },
            ],
        }).compile()

        service = module.get<RoleService>(RoleService)
        roleRepo = module.get<Repository<Role>>(getRepositoryToken(Role))
    })

    describe('create', () => {
        let createRoleDto: Partial<CreateRoleDto>

        beforeEach(async () => {
            createRoleDto = createRoleDtoMock
        })

        it('should create role', async () => {
            jest.spyOn(roleRepo, 'findOneBy').mockResolvedValueOnce(null)
            jest.spyOn(roleRepo, 'save').mockResolvedValueOnce({
                ...createRoleDto,
                id: 'id',
            } as Role)

            const res = await service.create(createRoleDto as CreateRoleDto)

            expect(roleRepo.findOneBy).toHaveBeenCalledWith({
                value: createRoleDto.value,
            })
            expect(roleRepo.save).toHaveBeenCalledWith(createRoleDto)
            expect(res).toEqual(expect.objectContaining(createRoleDto))
            expect(res.id).toBeDefined()
        })

        it('exist role', async () => {
            jest.spyOn(roleRepo, 'findOneBy').mockResolvedValueOnce({
                ...createRoleDto,
            } as Role)
            jest.spyOn(roleRepo, 'save')

            await expect(
                service.create(createRoleDto as CreateRoleDto),
            ).rejects.toThrow(ConflictException)

            expect(roleRepo.findOneBy).toHaveBeenCalledWith({
                value: createRoleDto.value,
            })
            expect(roleRepo.save).not.toHaveBeenCalled()
        })
    })

    describe('update', () => {
        let role: Partial<Role>
        let updateRoleDto: Partial<UpdateRoleDto>

        beforeEach(() => {
            role = roleMock
            updateRoleDto = updateRoleDtoMock
        })

        it('should update role', async () => {
            jest.spyOn(roleRepo, 'findOneBy').mockResolvedValueOnce(
                role as Role,
            )
            jest.spyOn(roleRepo, 'save').mockResolvedValueOnce({
                ...role,
                ...updateRoleDto,
            } as Role)

            const result = await service.update(
                role.id as string,
                updateRoleDto as UpdateRoleDto,
            )

            expect(roleRepo.findOneBy).toHaveBeenCalledWith({id:role.id})
            expect(roleRepo.save).toHaveBeenCalledWith({...role,...updateRoleDto})
            expect(result.id).toBe(role.id)
            expect(result).toEqual(expect.objectContaining(updateRoleDto))
        })

        it('should not found', async () => {
            jest.spyOn(roleRepo, 'findOneBy').mockResolvedValueOnce(null)
            jest.spyOn(roleRepo, 'save')

            await expect(
                service.update(
                    role.id as string,
                    updateRoleDto as UpdateRoleDto,
                ),
            ).rejects.toThrow(NotFoundException)

            expect(roleRepo.findOneBy).toHaveBeenCalledWith({id:role.id})
            expect(roleRepo.save).not.toHaveBeenCalled()
        })
    })
})
