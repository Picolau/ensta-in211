import typeorm from "typeorm";

const { MigrationInterface, QueryRunner } = typeorm;

export default class AddComment1683648932752 {
    name = 'AddComment1683648932752'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user_movie"
            ADD "comment" character varying
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user_movie" DROP COLUMN "comment"
        `);
    }
}
