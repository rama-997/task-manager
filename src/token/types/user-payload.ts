import { ERoles } from '@src/role/types'

export interface UserPayload{
    id:string
    roles:ERoles[]
}