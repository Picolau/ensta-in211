import typeorm from "typeorm";

const { MigrationInterface, QueryRunner } = typeorm;

export default class UpdateUserMovieTable1683399341178 {
    name = 'UpdateUserMovieTable1683399341178'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user_movie" DROP COLUMN "comment"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_movie" DROP COLUMN "liked"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_movie"
            ADD "rating" integer NOT NULL
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user_movie" DROP COLUMN "rating"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_movie"
            ADD "liked" boolean NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user_movie"
            ADD "comment" character varying NOT NULL
        `);
    }
}
