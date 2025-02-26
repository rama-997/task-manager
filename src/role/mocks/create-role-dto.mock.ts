import { CreateRoleDto } from '@src/role/dto'
import { ERoles } from '@src/role/types'

export const createRoleDtoMock: Partial<CreateRoleDto> = {
    value: ERoles.ADMIN,
    description:'description',
}