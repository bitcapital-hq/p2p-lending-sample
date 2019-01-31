import { validate, IsInt, IsNumber, IsEnum, IsNotEmpty } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Timestamp } from "typeorm";
import { AppEntity, User,  Proposal } from ".";

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid"
}

@Entity(Payment.tableName)
export default class Payment extends AppEntity {
  public static readonly tableName = "payments";

  @IsNotEmpty()
  @ManyToOne(type => User, origin => origin.payments, {
    nullable: false,
    cascade: ["insert", "update"]
  })
  origin: User;

  @IsNotEmpty()
  @ManyToOne(type => User, recipient => recipient.incames, {
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

  @Column({ nullable: false, type: "timestamp" })
  dueTo: Timestamp;
  
  constructor(data: Partial<Payment>) {
    super();
    Object.assign(this, data, {});
  }

  public async validate() {
    return validate(this);
  }

  /**
   * Finds payment by its id.
   * 
   * @param id The payment ID
   */
  public static async findById(id: number) {
    return this.findOne({ where: { id } });
  }
}