import typeorm from "typeorm";

const { MigrationInterface, QueryRunner } = typeorm;

export default class UpdateMovie1682327374868 {
    name = 'UpdateMovie1682327374868'

    async up(queryRunner) {
        await queryRunner.query(`
            DELETE FROM "movie"
        `);
        await queryRunner.query(`
            ALTER TABLE "movie"
            ADD "overview" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "movie"
            ADD "vote_average" integer NOT NULL
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "movie" DROP COLUMN "vote_average"
        `);
        await queryRunner.query(`
            ALTER TABLE "movie" DROP COLUMN "overview"
        `);
    }
}
