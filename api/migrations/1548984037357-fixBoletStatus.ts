import {MigrationInterface, QueryRunner} from "typeorm";

export class fixBoletStatus1548984037357 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "boletos" ALTER COLUMN "amount" DROP DEFAULT`);
        await queryRunner.query(`ALTER TYPE "boletos_status_enum" RENAME TO "boletos_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "boletos_status_enum" AS ENUM('expired', 'pending', 'paid')`);
        await queryRunner.query(`ALTER TABLE "boletos" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "boletos" ALTER COLUMN "status" TYPE "boletos_status_enum" USING "status"::"text"::"boletos_status_enum"`);
        await queryRunner.query(`ALTER TABLE "boletos" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "boletos_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TYPE "boletos_status_enum_old" AS ENUM('pending', 'paid')`);
        await queryRunner.query(`ALTER TABLE "boletos" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "boletos" ALTER COLUMN "status" TYPE "boletos_status_enum_old" USING "status"::"text"::"boletos_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "boletos" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "boletos_status_enum"`);
        await queryRunner.query(`ALTER TYPE "boletos_status_enum_old" RENAME TO "boletos_status_enum"`);
        await queryRunner.query(`ALTER TABLE "boletos" ALTER COLUMN "amount" SET DEFAULT 0`);
    }

}
