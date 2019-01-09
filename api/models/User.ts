import { Validate, IsEnum, IsAlphanumeric, ValidatorConstraint, ValidationArguments, ValidatorConstraintInterface, IsEmail, validate, IsBoolean, IsInt } from "class-validator";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import * as cpf from "cpf";

export enum UserStatus {
  ACTIVE = "active",
  PENDING = "pending",
  INACTIVE = "inactive"
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
export default class User extends BaseEntity {
  public static readonly tableName = 'users';

  @PrimaryGeneratedColumn("uuid")
  id: number;

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
  @Column({ nullable: true, type: 'int',  unique: true })
  phoneNumber: number;
  
  @IsAlphanumeric()
  @Column({ nullable: true, unique: true })
  phoneCountryCode: string;

  @IsAlphanumeric()
  @Column({ nullable: true, type: 'int', unique: true })
  phoneLocalCode: number;

  @Validate(IsCPF)
  @Column({ nullable: true })
  finacialId: string

  @IsEnum(UserStatus)
  @Column("enum", { enum: UserStatus, default: UserStatus.INACTIVE, nullable: false })
  status: UserStatus

  @IsAlphanumeric()
  @Column({ nullable: true })
  address: string

  @IsAlphanumeric()
  @Column({ nullable: true })
  addressNumber: string

  @IsAlphanumeric()
  @Column({ nullable: true })
  complement: string

  @IsAlphanumeric()
  @Column({ nullable: true })
  postcode: string

  @IsAlphanumeric()
  @Column({ nullable: true })
  addressReference: string

  @IsAlphanumeric()
  @Column({ nullable: true })
  bankCode: string

  @IsAlphanumeric()
  @Column({ nullable: true })
  branch: string

  @IsAlphanumeric()
  @Column({ nullable: true })
  account: string

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
}
