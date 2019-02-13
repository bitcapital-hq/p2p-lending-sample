import { validate, IsNumber, IsEnum, IsNotEmpty } from "class-validator";
import { Column, PrimaryGeneratedColumn, Timestamp, Entity, BeforeUpdate, BeforeInsert } from "typeorm";
import { BaseError } from "ts-framework-common";
import BitcapitalService  from "../services/BitcapitalService";
import { AppEntity } from ".";
import * as date from "calcudate";

export enum BoletoStatus {
  EXPIRED = "expired",
  PENDING = "pending",
  PAID = "paid"
};

@Entity(Boleto.tableName)
export default class Boleto extends AppEntity {
  public static readonly tableName = "boletos";

  @PrimaryGeneratedColumn("uuid")
  id: number;

  @IsNotEmpty()
  @Column({ nullable: false, type: "uuid" })
  walletId: string | number;

  @IsNotEmpty()
  @IsNumber()
  @Column({ nullable: false, type: "float8" })
  amount: number;

  @Column({ nullable: false, type: "timestamp" })
  dueTo: Timestamp;

  @IsEnum(BoletoStatus)
  @Column("enum", { enum: BoletoStatus, default: BoletoStatus.PENDING as any, nullable: false })
  status: BoletoStatus;

  // @Column({ nullable: false, type: "varchar", default: this.id })
  // codebarr: string;

  // @BeforeInsert()
  // async setCodebarr() {
  //   try {
  //     let bitcapital = await BitcapitalService.authenticateMediator();
  //     bitcapital.payments().pay({
  //       destination: this.walletId,
  //       asset: process.env.LOCAL_ASSET_ID
  //     } as any).
  //   } catch(e) {
  //     throw e;
  //   }
  // }

  @BeforeUpdate()
  verifyDueTo() {
    if (+this.dueTo < Date.now()) {
      this.status = BoletoStatus.EXPIRED;
      this.save();
      throw new BaseError('Boleto expired. Code 400');
    }
  }

  constructor(data: Partial<Boleto>) {
    super();
    Object.assign(this, data, {});
  }

  public async validate() {
    return validate(this);
  }

  /**
   * Find the boleto by it's id
   * @param id the id of the boleto
   */
  public static async findById(id: string) {
    try {
      return this.findOne(id)
    } catch(e) {
      throw new BaseError(e.message);
    }
  }
  /**
   * Update a boleto to paid status and pay the wallet
   * @param id the id of the boleto to pay
   */
  public static async payBoleto(id: number) {
    try {
      let boleto = await this.findOne({ where: { id } });

      boleto.status = BoletoStatus.PAID;
      await boleto.save();

      return true;
    } catch(e) {
      throw e;
    }
  }
  /**
   * Create a boleto to be payd for a wallet
   * @param walletId the id of the receipient wallet
   * @param amount the amount to be paid to the wallet
   */
  public static async createBoleto(walletId: string, amount: number): Promise<Boleto> {
    try {
      let dueTo = date.add().days(2);
      let boleto = await this.create({
        walletId,
        amount,
        dueTo
      }).save();

      return  boleto;
    } catch(e) {
      throw e;
    }
  }
}