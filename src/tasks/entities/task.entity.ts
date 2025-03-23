import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { TaskStatus } from '@src/tasks/types'
import { User } from '@src/auth/entities'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

@Entity()
export class Task {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({
        type: 'string',
        description: 'Task uuid',
        name: 'id',
    })
    readonly id?: string

    @Column()
    @ApiProperty({
        type: 'string',
        description: 'my task desc...',
        name: 'title',
    })
    title: string

    @Column()
    @ApiProperty({
        type: 'string',
        description: 'my task desc...',
        name: 'description',
    })
    description: string

    @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
    @ApiProperty({
        type: 'string',
        description: 'my task desc...',
        name: 'status',
    })
    status?: TaskStatus

    @ManyToOne(() => User, user => user.tasks, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    @ApiProperty({
        type: () => User,
        description: 'user entity',
        name: 'user',
    })
    @Exclude()
    user: User

    @CreateDateColumn({ name: 'created_at' })
    @ApiProperty({
        name: 'created_at',
        description: 'The date creating of task',
        type: 'string',
    })
    readonly createdAt?: Date

    @UpdateDateColumn({ name: 'updated_at' })
    @ApiProperty({
        name: 'updated_at',
        description: 'The date updating of task',
        type: 'string',
    })
    readonly updatedAt?: Date

    constructor(partial: Partial<Task>) {
        Object.assign(this, partial)
    }
}
