import { ERoles } from '@src/role/types'
import { IsEnum, IsOptional } from 'class-validator'

export class CreateRoleDto{
    @IsEnum(ERoles)
    value:ERoles

    @IsOptional()
    description:string
}