import { ConflictException, Injectable } from '@nestjs/common'
import { SignUpDto } from '@src/auth/dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@src/auth/entities'
import { Repository } from 'typeorm'
import { hash } from 'bcryptjs'

@Injectable()
export class AuthService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

    async signUp(signUpDto: SignUpDto): Promise<{message:string}> {
        let user=await this.userRepository.findOneBy({ email: signUpDto.email })
        if (!user) {
            throw new ConflictException('Такой e-mail уже зарегистрирован')
        }
        user=await this.userRepository.findOneBy({ login: signUpDto.login })
        if(!user) {
            throw new ConflictException('Такой логин уже занят')
        }
        const hashedPass=await hash(signUpDto.password,3)
        await this.userRepository.save({...signUpDto,password:hashedPass})

    }
}
