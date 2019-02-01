import { 
  IsAlphanumeric,
  validate,
  IsInt,
  IsEnum,
  IsNotEmpty,
  IsNumber 
} from "class-validator";
import {
  Column,
  Entity,
  ManyToOne,
  AfterUpdate,
  BeforeUpdate,
  BeforeInsert
} from "typeorm";
import { BaseError } from "ts-framework-common";
import { AppEntity, User, Payment } from ".";
import BalanceService from "../services/BalanceService";
import * as date from "calcudate";
import Helpers from "../lib/Helpers";

export enum ProposalStatus {
  PENDING = "pending",
  OPEN = "open",
  CLOSE = "close"
}

@Entity(Proposal.tableName)
export default class Proposal extends AppEntity {
  public static readonly tableName = "proposals";

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
  @Column("enum", { enum: ProposalStatus, default: ProposalStatus.OPEN, nullable: false })
  status: ProposalStatus;

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
  minInstallments: number;

  @IsNotEmpty()
  @IsInt()
  @Column({ nullable: false, type: "int" })
  maxInstallments: number;

  @IsNotEmpty()
  @IsInt()
  @Column({ nullable: true, type: "int" })
  finalInstallments: number;

  @IsNotEmpty()
  @IsInt()
  @Column({ nullable: true, type: "float" })
  finalAmount: number;

  @BeforeInsert()
  async verifyBalance() {
    let lendable = await BalanceService.getLendableBalanceById(this.owner.id as any);

    if (lendable < this.amount) {
      throw new BaseError('Insufitient funds to create proposal. Code 400.');
    }
  }

  @BeforeUpdate()
  verifyInstalments() {
    if (this.finalInstallments &&
      (this.finalInstallments < this.minInstallments || this.finalInstallments > this.maxInstallments)) {
      throw new BaseError(`Total instalments must be between ${this.minInstallments} and ${this.maxInstallments}. Code 400.`);
    }

    if (this.finalInstallments && !this.finalAmount) {
      this.finalAmount = this.amount + Helpers.totalInterest(this.monthlyInterest, this.amount, this.finalInstallments);
    }
  }

  @AfterUpdate()
  async createPayments() {
    if (this.finalAmount && this.payments.length !== this.finalInstallments) {
      const payments = [];
      const sigleAmount = this.finalAmount / this.finalInstallments;

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

      await Payment.insert(payments);
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