import { IsAlphanumeric, validate, IsInt, IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, Timestamp } from "typeorm";
import { User } from ".";

export enum ProposalStatus {
  PENDING = "pending",
  OPEN = "open",
  CLOSE = "close"
}

@Entity(Proposal.tableName)
export default class Proposal extends BaseEntity {
  public static readonly tableName = "proposals";

  @PrimaryGeneratedColumn("uuid")
  id: number;

  @IsNotEmpty()
  @IsAlphanumeric()
  @Column({ nullable: false, type: "float" })
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  @Column({ nullable: false, type: "float" })
  monthlyInterest: number;

  @IsNotEmpty()
  @IsEnum(ProposalStatus)
  @Column("enum", { enum: ProposalStatus, default: ProposalStatus.PENDING, nullable: false })
  status: ProposalStatus.PENDING;

  @IsNotEmpty()
  @ManyToOne(type => User, owner => owner.id, {
    nullable: false,
    cascade: ["insert", "update"]
  })
  owner: User;

  @ManyToOne(type => User, borrower => borrower.id, {
    nullable: true,
    cascade: ["insert", "update"]
  })
  borrower: User;

  @IsNotEmpty()
  @IsInt()
  @Column({ nullable: false, type: "int" })
  minInstalments: number;

  @IsNotEmpty()
  @IsInt()
  @Column({ nullable: false, type: "int" })
  maxInstalments: number;

  @IsNotEmpty()
  @IsInt()
  @Column({ nullable: true, type: "int" })
  finalInstalments: number;

  @Column({ nullable: false, type: "timestamp", default: new Date() })
  createdAt: Timestamp;
  
  @Column({ nullable: true, type: "timestamp" })
  updatedAt: Timestamp;

  @Column({ nullable: true, type: "timestamp" })
  deletedAt: Timestamp;

  constructor(data: Partial<Proposal>) {
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