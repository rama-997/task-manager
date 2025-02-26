import { SetMetadata } from '@nestjs/common'
import { ERoles } from '@src/role/types'

export const ROLE_KEY = 'role_key'

export const RoleDecorator = (...roles: ERoles[]) =>
    SetMetadata(ROLE_KEY, roles)
