import {MigrationInterface, QueryRunner} from "typeorm";

export class fixBoleto1548983112661 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "boletos" ADD "amount" double precision NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "boletos" DROP COLUMN "amount"`);
    }

}
