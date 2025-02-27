import { Test, TestingModule } from '@nestjs/testing'
import { TokenService } from './token.service'
import { JwtService } from '@nestjs/jwt'
import { User } from '@src/user/entities'
import { userMock } from '@src/user/mocks/user.mock'

describe('TokenService', () => {
    let service: TokenService
    let jwtService: JwtService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TokenService,JwtService],
        }).compile()

        service = module.get<TokenService>(TokenService)
        jwtService = module.get<JwtService>(JwtService)
    })

    describe('authTokens', () => {
        let user:Partial<User>

        beforeEach(async () => {
            user=userMock
        })

        it('should get tokens', async () => {
            jest.spyOn(jwtService,'signAsync').mockResolvedValueOnce('access')
            jest.spyOn(jwtService,'signAsync').mockResolvedValue('refresh')

            const res=await service.authTokens(user as User)

            expect(res.accessToken).toBeDefined()
            expect(res.refreshToken).toBeDefined()
            expect(jwtService.signAsync).toHaveBeenNthCalledWith(1,{id:user.id,roles:user.roles},{expiresIn: '1h'})
            expect(jwtService.signAsync).toHaveBeenNthCalledWith(2,{id:user.id,roles:user.roles},{expiresIn: '7d'})
            expect(jwtService.signAsync).toHaveBeenCalledTimes(2)
        })
    })
})
