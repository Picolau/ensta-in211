import typeorm from "typeorm";

const { MigrationInterface, QueryRunner } = typeorm;

export default class UpdateMovieVoteAvgDouble1683476673003 {
    name = 'UpdateMovieVoteAvgDouble1683476673003'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "movie" DROP COLUMN "vote_average"
        `);
        await queryRunner.query(`
            ALTER TABLE "movie"
            ADD "vote_average" double precision NOT NULL
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "movie" DROP COLUMN "vote_average"
        `);
        await queryRunner.query(`
            ALTER TABLE "movie"
            ADD "vote_average" integer NOT NULL
        `);
    }
}
