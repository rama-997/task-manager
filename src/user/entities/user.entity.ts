import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
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

    @Column()
    name: string

    @Column({ nullable: true })
    photo: string

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
    roles: Role[]
}
