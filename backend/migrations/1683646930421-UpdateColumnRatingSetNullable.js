import typeorm from "typeorm";

const { MigrationInterface, QueryRunner } = typeorm;

export default class UpdateColumnRatingSetNullable1683646930421 {
    name = 'UpdateColumnRatingSetNullable1683646930421'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user_movie"
            ALTER COLUMN "rating" DROP NOT NULL
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user_movie"
            ALTER COLUMN "rating"
            SET NOT NULL
        `);
    }
}
