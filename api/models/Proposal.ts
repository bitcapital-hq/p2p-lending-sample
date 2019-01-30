import { IsAlphanumeric, validate, IsInt, IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Timestamp,
  AfterUpdate,
  BeforeUpdate,
  BeforeInsert
} from "typeorm";
import { BaseError } from "ts-framework-common";
import { User, Payment } from ".";
import BalanceService from "../services/BalanceService";
import * as date from "calcudate";
import Helpers from "../lib/Helpers";

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
  @ManyToOne(type => User, owner => owner.proposals)
  owner: User;

  @ManyToOne(type => User, borrower => borrower.loans, {
    nullable: true,
    cascade: ["insert", "update"]
  })
  borrower: User;

  @ManyToOne(type => Payment, payment => payment.proposal, {
    nullable: true,
    cascade: ["insert", "update"]
  })
  payments: Payment[];

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

  @IsNotEmpty()
  @IsInt()
  @Column({ nullable: true, type: "float" })
  finalAmount: number;

  @Column({ nullable: false, type: "timestamp", default: new Date() })
  createdAt: Timestamp;
  
  @Column({ nullable: true, type: "timestamp" })
  updatedAt: Timestamp;

  @Column({ nullable: true, type: "timestamp" })
  deletedAt: Timestamp;

  @BeforeInsert()
  async verifyBalance() {
    let lendable = await BalanceService.getLendableBalanceById(this.owner.id as any);
//console.log(lendable, 'LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL', this.amount)
    if (lendable < this.amount) {
      throw new BaseError('Insufitient funds to create proposal');
    }
  }

  @BeforeUpdate()
  verifyInstalments() {
    if (this.finalInstalments &&
      (this.finalInstalments < this.minInstalments || this.finalInstalments > this.maxInstalments)) {
      throw new Error(`Total instalments must be between ${this.minInstalments} and ${this.maxInstalments}.`);
    }

    if (this.finalInstalments && !this.finalAmount) {
      this.finalAmount = this.amount + Helpers.totalInterest(this.monthlyInterest, this.amount, this.finalInstalments);
    }
  }

  @AfterUpdate()
  createPayments() {
    if (this.finalAmount && this.payments.length !== this.finalInstalments) {
      const payments = [];
      const sigleAmount = this.finalAmount / this.finalInstalments;

      for (let i = 0; i < this.finalAmount; i++) {
        let payment = new  Payment({
          proposal: this,
          origin: this.borrower,
          recipient: this.owner,
          dueTo: date.add().months(i + 1) as any,
          amount: sigleAmount
        });

        payments.push(payment);
      }

      Payment.insert(payments);
    }    
  }

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