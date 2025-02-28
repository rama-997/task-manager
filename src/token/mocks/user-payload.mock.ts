import { UserPayload } from '@src/token/types'
import { ERoles } from '@src/role/types'

export const userPayloadMock: Partial<UserPayload> = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    roles: [ERoles.ADMIN],
}