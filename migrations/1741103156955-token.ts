import { MigrationInterface, QueryRunner } from "typeorm";

export class Token1741103156955 implements MigrationInterface {
    name = 'Token1741103156955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "refresh_token" character varying NOT NULL, "user_agent" character varying NOT NULL, CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "token_users" ("token_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_df1c05fc79826c73f54bf36fd91" PRIMARY KEY ("token_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_26e8f22bb8ec8570b56ccdf189" ON "token_users" ("token_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c7fdee16b6f1e98b874937a378" ON "token_users" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "token_users" ADD CONSTRAINT "FK_26e8f22bb8ec8570b56ccdf189e" FOREIGN KEY ("token_id") REFERENCES "token"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "token_users" ADD CONSTRAINT "FK_c7fdee16b6f1e98b874937a3782" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token_users" DROP CONSTRAINT "FK_c7fdee16b6f1e98b874937a3782"`);
        await queryRunner.query(`ALTER TABLE "token_users" DROP CONSTRAINT "FK_26e8f22bb8ec8570b56ccdf189e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c7fdee16b6f1e98b874937a378"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_26e8f22bb8ec8570b56ccdf189"`);
        await queryRunner.query(`DROP TABLE "token_users"`);
        await queryRunner.query(`DROP TABLE "token"`);
    }

}
