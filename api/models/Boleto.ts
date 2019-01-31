import { validate, IsNumber, IsEnum, IsNotEmpty } from "class-validator";
import { Column, PrimaryGeneratedColumn, Timestamp, Entity, BeforeUpdate } from "typeorm";
import { BaseError } from "ts-framework-common";
import { AppEntity } from ".";
import * as date from "calcudate";

export enum BoletoStatus {
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
  amount: number;

  @Column({ nullable: false, type: "timestamp" })
  dueTo: Timestamp;

  @IsEnum(BoletoStatus)
  @Column("enum", { enum: BoletoStatus, default: BoletoStatus.PENDING as any, nullable: false })
  status: BoletoStatus;

  @BeforeUpdate()
  verifyDueTo() {
    if (+this.dueTo < Date.now()) {
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
   * Update a boleto to paid status and pay the wallet
   * @param id the id of the boleto to pay
   */
  public static async payBoleto(id: number) {
    try {
      let boleto = await this.findOne({ where: { id } });
      boleto.status = BoletoStatus.PAID;

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
      let dueTo = +date.add().days(2);
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