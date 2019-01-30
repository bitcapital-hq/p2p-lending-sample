import {MigrationInterface, QueryRunner} from "typeorm";

export class createDatabase1548786260716 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "entities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "name" character varying NOT NULL, "wallet" integer NOT NULL, CONSTRAINT "PK_8640855ae82083455cbb806173d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "users_status_enum" AS ENUM('active', 'pending', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bitCapitalId" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "phoneNumber" integer, "phoneCountryCode" character varying, "phoneLocalCode" integer, "taxId" character varying, "status" "users_status_enum" NOT NULL DEFAULT 'inactive', "address" character varying, "addressNumber" character varying, "complement" character varying, "postcode" character varying, "addressReference" character varying, "bankCode" character varying, "branch" character varying, "account" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT '"2019-01-29T18:24:21.100Z"', "updatedAt" TIMESTAMP, "deletedAt" TIMESTAMP, CONSTRAINT "UQ_791421f09fed3b6c7ad8081ca41" UNIQUE ("bitCapitalId"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293" UNIQUE ("phoneNumber"), CONSTRAINT "UQ_2aac7de7c15294c7f90a51d0651" UNIQUE ("phoneCountryCode"), CONSTRAINT "UQ_1c52af04ed577a0ab7675f7a969" UNIQUE ("taxId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "proposals_status_enum" AS ENUM('pending', 'open', 'close')`);
        await queryRunner.query(`CREATE TABLE "proposals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" double precision NOT NULL, "monthlyInterest" double precision NOT NULL, "status" "proposals_status_enum" NOT NULL DEFAULT 'pending', "minInstalments" integer NOT NULL, "maxInstalments" integer NOT NULL, "finalInstalments" integer, "finalAmount" double precision, "createdAt" TIMESTAMP NOT NULL DEFAULT '"2019-01-29T18:24:21.148Z"', "updatedAt" TIMESTAMP, "deletedAt" TIMESTAMP, "ownerId" uuid, "borrowerId" uuid, "paymentsId" uuid, CONSTRAINT "PK_db524c8db8e126a38a2f16d8cac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "payments_status_enum" AS ENUM('pending', 'paid')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" double precision NOT NULL, "instalment" integer NOT NULL, "totalInstalments" integer NOT NULL, "status" "payments_status_enum" NOT NULL DEFAULT 'pending', "dueTo" TIMESTAMP NOT NULL DEFAULT '"2019-01-29T18:24:21.149Z"', "createdAt" TIMESTAMP NOT NULL DEFAULT '"2019-01-29T18:24:21.149Z"', "updatedAt" TIMESTAMP, "deletedAt" TIMESTAMP, "originId" uuid NOT NULL, "recipientId" uuid NOT NULL, "proposalId" uuid NOT NULL, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "proposals" ADD CONSTRAINT "FK_e7ccfe2df3d3dfcd2c467c7f28f" FOREIGN KEY ("ownerId") REFERENCES "users"("id")`);
        await queryRunner.query(`ALTER TABLE "proposals" ADD CONSTRAINT "FK_8be57c0cf35782937081ae92bc0" FOREIGN KEY ("borrowerId") REFERENCES "users"("id")`);
        await queryRunner.query(`ALTER TABLE "proposals" ADD CONSTRAINT "FK_47af2b9e23376414a07275a2e7e" FOREIGN KEY ("paymentsId") REFERENCES "payments"("id")`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_ac8532363b9a2bba851877107d7" FOREIGN KEY ("originId") REFERENCES "users"("id")`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_f605003e6dafd6b3ae497c12686" FOREIGN KEY ("recipientId") REFERENCES "users"("id")`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_acea325721fd062c39299d22086" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_acea325721fd062c39299d22086"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_f605003e6dafd6b3ae497c12686"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_ac8532363b9a2bba851877107d7"`);
        await queryRunner.query(`ALTER TABLE "proposals" DROP CONSTRAINT "FK_47af2b9e23376414a07275a2e7e"`);
        await queryRunner.query(`ALTER TABLE "proposals" DROP CONSTRAINT "FK_8be57c0cf35782937081ae92bc0"`);
        await queryRunner.query(`ALTER TABLE "proposals" DROP CONSTRAINT "FK_e7ccfe2df3d3dfcd2c467c7f28f"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "payments_status_enum"`);
        await queryRunner.query(`DROP TABLE "proposals"`);
        await queryRunner.query(`DROP TYPE "proposals_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "users_status_enum"`);
        await queryRunner.query(`DROP TABLE "entities"`);
    }

}

/**
 * insert into users ("firstName", "lastName", "email", "taxId", "bitCapitalId") values ('Fabio', 'Soares', 'fabio@test.com', '66779390062','54923479-b574-41dc-bb51-56806efad1a6');
 */