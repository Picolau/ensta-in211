import typeorm from "typeorm";

const { MigrationInterface, QueryRunner } = typeorm;

export default class UpdateUserMovie1682327343438 {
    name = 'UpdateUserMovie1682327343438'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user_movie"
            ADD "comment" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user_movie"
            ADD "liked" boolean NOT NULL
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user_movie" DROP COLUMN "liked"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_movie" DROP COLUMN "comment"
        `);
    }
}
