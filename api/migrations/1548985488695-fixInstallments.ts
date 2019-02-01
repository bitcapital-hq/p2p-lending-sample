import {MigrationInterface, QueryRunner} from "typeorm";

export class fixInstallments1548985488695 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "proposals" DROP COLUMN "minInstalments"`);
        await queryRunner.query(`ALTER TABLE "proposals" DROP COLUMN "maxInstalments"`);
        await queryRunner.query(`ALTER TABLE "proposals" DROP COLUMN "finalInstalments"`);
        await queryRunner.query(`ALTER TABLE "proposals" ADD "minInstallments" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "proposals" ADD "maxInstallments" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "proposals" ADD "finalInstallments" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "proposals" DROP COLUMN "finalInstallments"`);
        await queryRunner.query(`ALTER TABLE "proposals" DROP COLUMN "maxInstallments"`);
        await queryRunner.query(`ALTER TABLE "proposals" DROP COLUMN "minInstallments"`);
        await queryRunner.query(`ALTER TABLE "proposals" ADD "finalInstalments" integer`);
        await queryRunner.query(`ALTER TABLE "proposals" ADD "maxInstalments" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "proposals" ADD "minInstalments" integer NOT NULL`);
    }

}
