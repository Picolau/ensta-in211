import typeorm from "typeorm";

const { MigrationInterface, QueryRunner } = typeorm;

export default class Update1682327071666 {
    name = 'Update1682327071666'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user_life_movie" RENAME TO "user_movie"
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user_movie" RENAME TO "user_life_movie"
        `);
    }
}
