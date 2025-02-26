import { Test, TestingModule } from '@nestjs/testing'
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'
import { Repository } from 'typeorm'
import { Role } from '@src/role/entities'
import { getRepositoryToken } from '@nestjs/typeorm'
import { HttpExceptionFilter } from '@libs/common'

describe('AppController (e2e)', () => {
    let app: INestApplication<App>
    let roleRepo: Repository<Role>

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [
                { provide: getRepositoryToken(Role), useClass: Repository },
            ],
        }).compile()

        app = moduleFixture.createNestApplication()
        app.useGlobalFilters(new HttpExceptionFilter())
        app.useGlobalPipes(new ValidationPipe({transform: true}))

        roleRepo=moduleFixture.get<Repository<Role>>(getRepositoryToken(Role))
        await app.init()
    })

    beforeEach(async () => {
        await roleRepo.query('TRUNCATE role CASCADE;')
    })

    afterAll(async () => {
        await app.close()
    })

    describe('POST /role', () => {
        it('OK', async() => {
            return request(app.getHttpServer())
                .post('/role')
                // .auth()
                // .expect(HttpStatus.OK)
                // .expect()
        })
    })
})
