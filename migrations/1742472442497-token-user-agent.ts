import { MigrationInterface, QueryRunner } from "typeorm";

export class TokenUserAgent1742472442497 implements MigrationInterface {
    name = 'TokenUserAgent1742472442497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" ALTER COLUMN "user_agent" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" ALTER COLUMN "user_agent" SET NOT NULL`);
    }

}
