import { ERoles } from '@src/role/types'

export interface UserPayload{
    userId: string
    roles:ERoles[]
}