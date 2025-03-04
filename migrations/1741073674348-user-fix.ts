import { MigrationInterface, QueryRunner } from "typeorm";

export class UserFix1741073674348 implements MigrationInterface {
    name = 'UserFix1741073674348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "name" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "name" SET NOT NULL`);
    }

}
