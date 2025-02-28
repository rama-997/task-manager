import { CreateRoleDto } from '@src/role/dto/create-role.dto'
import { ERoles } from '../types'
import { IsEnum, IsOptional } from 'class-validator'

export class UpdateRoleDto implements CreateRoleDto {
    @IsEnum(ERoles,{message:`Роль может быть только одним их этих значений: ${Object.values(ERoles)}`})
    value: ERoles

    @IsOptional()
    description: string
}