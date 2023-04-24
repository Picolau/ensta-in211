import typeorm from "typeorm";

const { MigrationInterface, QueryRunner } = typeorm;

export default class CreateUserLifeMovie1682126624702 {
    name = 'CreateUserLifeMovie1682126624702'

    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "user_life_movie" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" character varying NOT NULL,
                "movie_id" character varying NOT NULL,
                CONSTRAINT "PK_201a4794fa5ffb3bc966e363c26" PRIMARY KEY ("id")
            )
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            DROP TABLE "user_life_movie"
        `);
    }
}
