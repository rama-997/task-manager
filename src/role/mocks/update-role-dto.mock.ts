import { UpdateRoleDto } from '@src/role/dto'
import { ERoles } from '@src/role/types'

export const updateRoleDtoMock: Partial<UpdateRoleDto> = {
    value: ERoles.ADMIN,
    description:'update desc'
}