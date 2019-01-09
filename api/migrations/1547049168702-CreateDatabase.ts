import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateDatabase1547049168702 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TYPE "users_status_enum" AS ENUM('active', 'pending', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "phoneNumber" integer, "phoneCountryCode" character varying, "phoneLocalCode" integer, "finacialId" character varying, "status" "users_status_enum" NOT NULL DEFAULT 'inactive', "address" character varying, "addressNumber" character varying, "complement" character varying, "postcode" character varying, "addressReference" character varying, "bankCode" character varying, "branch" character varying, "account" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293" UNIQUE ("phoneNumber"), CONSTRAINT "UQ_2aac7de7c15294c7f90a51d0651" UNIQUE ("phoneCountryCode"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "proposals_status_enum" AS ENUM('pending', 'open', 'close')`);
        await queryRunner.query(`CREATE TABLE "proposals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" double precision NOT NULL, "interest" double precision NOT NULL, "status" "proposals_status_enum" NOT NULL DEFAULT 'pending', "minInstalments" integer NOT NULL, "maxInstalments" integer NOT NULL, "ownerId" uuid NOT NULL, CONSTRAINT "PK_db524c8db8e126a38a2f16d8cac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "proposals" ADD CONSTRAINT "FK_e7ccfe2df3d3dfcd2c467c7f28f" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "proposals" DROP CONSTRAINT "FK_e7ccfe2df3d3dfcd2c467c7f28f"`);
        await queryRunner.query(`DROP TABLE "proposals"`);
        await queryRunner.query(`DROP TYPE "proposals_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "users_status_enum"`);
    }

}
