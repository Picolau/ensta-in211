import typeorm from "typeorm";

const { MigrationInterface, QueryRunner } = typeorm;

export default class UpdateUserAddPassword1683423187554 {
    name = 'UpdateUserAddPassword1683423187554'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "firstname"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "lastname"
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "username" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username")
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "password" character varying NOT NULL
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "password"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "username"
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "lastname" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "firstname" character varying NOT NULL
        `);
    }
}
