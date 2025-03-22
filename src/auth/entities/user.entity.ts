import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Role } from '@src/role/entities'
import { Token } from '@src/token/entities'
import { Task } from '@src/tasks/entities'
import { ApiProperty } from '@nestjs/swagger'

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({
        name: 'id',
        description: 'user id',
        type: 'string',
    })
    readonly id: string

    @Column({ unique: true, nullable: true })
    @ApiProperty({
        name: 'login',
        description: 'user login',
        type: 'string',
    })
    login: string

    @Column({ unique: true })
    @ApiProperty({
        name: 'email',
        description: 'user email',
        type: 'string',
    })
    email: string

    @Column()
    @ApiProperty({
        name: 'password',
        description: 'user password',
        type: 'string',
    })
    password: string

    @Column({ nullable: true })
    @ApiProperty({
        name: 'name',
        description: 'user name',
        type: 'string',
    })
    name?: string

    @Column({ nullable: true })
    @ApiProperty({
        name: 'photo',
        description: 'user photo',
        type: 'string',
    })
    photo?: string

    @Column({ default: false, name: 'is_confirm' })
    @ApiProperty({
        name: 'isConfirm',
        description: 'user isConfirm',
        type: 'boolean',
    })
    isConfirm?: boolean

    @ManyToMany(() => Role, role => role.users)
    @JoinTable({
        name: 'user_roles',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'role_id',
            referencedColumnName: 'id',
        },
    })
    // @ApiProperty({
    //     type: () => [Role],
    //     name: 'roles',
    //     description: 'roles entity',
    // })
    readonly roles: Role[]

    @ManyToMany(() => Token, token => token.users)
    // @ApiProperty({
    //     type: () => [Token],
    //     name: 'tokens',
    //     description: 'tokens entity',
    // })
    readonly tokens?: Token[]

    @OneToMany(() => Task, task => task.user)
    @ApiProperty({
        type: () => [Task],
        name: 'tasks',
        description: 'tasks entity',
    })
    readonly tasks: Task[]

    @CreateDateColumn({ name: 'created_at' })
    @ApiProperty({
        type: 'string',
        name: 'created_at',
        description: 'the creating date',
    })
    readonly createdAt?: Date

    @UpdateDateColumn({ name: 'updated_at' })
    @ApiProperty({
        type: 'string',
        name: 'created_at',
        description: 'the updating date',
    })
    readonly updatedAt?: Date
}
