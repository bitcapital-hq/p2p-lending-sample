import { IsAlphanumeric, validate, IsInt, IsNumber, IsEnum, IsNotEmpty, IsIn } from "class-validator";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, Timestamp } from "typeorm";
import { User,  Proposal } from ".";
import { userInfo } from "os";

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid"
}

@Entity(Payment.tableName)
export default class Payment extends BaseEntity {
  public static readonly tableName = "payments";

  @PrimaryGeneratedColumn("uuid")
  id: number;

  @IsNotEmpty()
  @ManyToOne(type => User, origin => origin.id, {
    nullable: false,
    cascade: ["insert", "update"]
  })
  origin: User;

  @IsNotEmpty()
  @ManyToOne(type => User, recipient => recipient.id, {
    nullable: false,
    cascade: ["insert", "update"]
  })
  recipient: User;

  @IsNotEmpty()
  @ManyToOne(type => Proposal, proposal => proposal.id, {
    nullable: false,
    cascade: ["insert", "update"]
  })
  proposal: Proposal;

  @IsNotEmpty()
  @IsNumber()
  @Column({ nullable: false, type: "float8" })
  amount: number;

  @IsNotEmpty()
  @IsInt()
  @Column({ nullable: false })
  instalment: number;

  @IsNotEmpty()
  @IsInt()
  @Column({ nullable: false })
  totalInstalments: number;

  @IsEnum(PaymentStatus)
  @Column("enum", { enum: PaymentStatus, default: PaymentStatus.PENDING, nullable: false })
  status: PaymentStatus.PENDING;

  @Column({ nullable: false, type: "timestamp", default: new Date() })
  dueTo: Timestamp;

  @Column({ nullable: false, type: "timestamp", default: new Date() })
  createdAt: Timestamp;
  
  @Column({ nullable: true, type: "timestamp" })
  updatedAt: Timestamp;

  @Column({ nullable: true, type: "timestamp" })
  deletedAt: Timestamp;

  constructor(data: Partial<Payment>) {
    super();
    Object.assign(this, data, {});
  }

  public async validate() {
    return validate(this);
  }

  /**
   * Finds proposal by its id.
   * 
   * @param id The proposal ID
   */
  public static async findById(id: number) {
    return this.findOne({ where: { id } });
  }
}
/**
    Tipo
    Depósito
    Prestação
    Referência ao Bitcapital Core

 */