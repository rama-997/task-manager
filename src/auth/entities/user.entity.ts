import {
    Column, CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm'
import { Role } from '@src/role/entities'

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    readonly id: string

    @Column({ unique: true, nullable: true })
    login: string

    @Column({ unique: true })
    email: string

    @Column()
    password: string

    @Column({ nullable: true })
    name?: string

    @Column({ nullable: true })
    photo?: string

    @Column({default: false,name:'is_confirm'})
    isConfirm?: boolean

    @ManyToMany(() => Role, role => role.users)
    @JoinTable({
        name: 'user_roles',
        joinColumn:{
            name: 'user_id',
            referencedColumnName:'id'
        },
        inverseJoinColumn:{
            name:'role_id',
            referencedColumnName:'id'
        }
    })
    readonly roles: Role[]

    @CreateDateColumn({ name: 'created_at' })
    readonly createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    readonly updatedAt: Date
}
