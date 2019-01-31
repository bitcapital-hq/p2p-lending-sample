import { 
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Timestamp 
} from "typeorm";
import {
  Validate,
  IsEnum,
  IsAlphanumeric,
  ValidationArguments,
  ValidatorConstraintInterface,
  IsEmail,
  validate,
  IsInt
} from "class-validator";
import * as cpf from "cpf";
import { AppEntity, Proposal, Payment } from ".";

export enum UserStatus {
  ACTIVE = "active",
  PENDING = "pending",
  INACTIVE = "inactive"
}

export enum UserRole {
  ADMIN = "admin",
  AUDIT = "audit",
  MEDIATOR = "mediator",
  CONSUMER = "consumer"
}

class IsCPF implements ValidatorConstraintInterface {
  validate(text: string) {
    return cpf.isValid(text);
  }

  defaultMessage(args: ValidationArguments) {
    return "Value ($value) is not a valid CPF.";
  }
}

@Entity(User.tableName)
export default class User extends AppEntity {
  public static readonly tableName = "users";

  @IsAlphanumeric()
  @Column({ nullable: false, unique: true })
  bitCapitalId: string;

  @IsAlphanumeric()
  @Column({ nullable: false })
  firstName: string;

  @IsAlphanumeric()
  @Column({ nullable: false })
  lastName: string;

  @IsEmail()
  @Column({ nullable: false, unique: true })
  email: string;

  @IsInt()
  @Column({ nullable: true, type: "int",  unique: true })
  phoneNumber: number;
  
  @IsAlphanumeric()
  @Column({ nullable: true, unique: true })
  phoneCountryCode: string;

  @IsAlphanumeric()
  @Column({ nullable: true, type: "int" })
  phoneLocalCode: number;

  @Validate(IsCPF)
  @Column({ nullable: true, unique: true })
  taxId: string;

  @IsEnum(UserStatus)
  @Column("enum", { enum: UserStatus, default: UserStatus.INACTIVE, nullable: false })
  status: UserStatus.INACTIVE;

  @IsAlphanumeric()
  @Column({ nullable: true })
  address: string;

  @IsAlphanumeric()
  @Column({ nullable: true })
  addressNumber: string;

  @IsAlphanumeric()
  @Column({ nullable: true })
  complement: string;

  @IsAlphanumeric()
  @Column({ nullable: true })
  postcode: string;

  @IsAlphanumeric()
  @Column({ nullable: true })
  addressReference: string;

  @IsAlphanumeric()
  @Column({ nullable: true })
  bankCode: string;

  @IsAlphanumeric()
  @Column({ nullable: true })
  branch: string;

  @IsAlphanumeric()
  @Column({ nullable: true })
  account: string;

  @OneToMany(type => Proposal, proposal => proposal.owner)
  proposals?: Proposal[];

  @OneToMany(type => Proposal, loan => loan.borrower, { 
    cascade: [ "insert", "update" ],
    onDelete: "SET NULL",
    nullable: true
  })
  loans?: Proposal[];

  @OneToMany(type => Payment, payment => payment.origin, { 
    cascade: [ "insert", "update" ],
    onDelete: "SET NULL",
    nullable: true
  })
  payments?: Payment[];

  @OneToMany(type => Payment, incame => incame.recipient, { 
    cascade: [ "insert", "update" ],
    onDelete: "SET NULL",
    nullable: true
  })
  incames?: Payment[];

  constructor(data: Partial<User>) {
    super();
    Object.assign(this, data, {});
  }

  public async validate() {
    return validate(this);
  }
  /**
   * Finds user by its email.
   * 
   * @param email The email address
   */
  public static async findByEmail(email: string) {
    return this.findOne({ where: { email } });
  }
  /**
   * Find user by bitCapitalId
   * @param bitCapitalId
   */
  public static async findByBitCapitalId(bitCapitalId: string) {
    return this.findOne({ where: { bitCapitalId } });
  }
  /**
   * Find user by id
   * @param id
   */
  public static async findById(id: string) {
    return this.findOne(id.trim());
  }
}
