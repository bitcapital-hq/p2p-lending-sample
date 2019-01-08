import { Validate, IsAlphanumeric, ValidatorConstraint, ValidationArguments, ValidatorConstraintInterface, IsEmail, validate, IsBoolean, IsInt } from "class-validator";
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

  @IsBoolean()
  @Column({ nullable: false, default: false })
  status: boolean  

  @IsAlphanumeric()
  @Column({ nullable: true })
  address: string

  @IsAlphanumeric()
  @Column({ nullable: true })
  addressNumber: string

  @IsAlphanumeric()
  @Column({ nullable: true })
  addressComplement: string

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

/**
 Usuário
Telefone
Country Code
Code
Number
Endereço
Logradouro
Número
CEP
Complemento
Referência
Dados bancários para saque (Opcional)
Nr da Agência
Nr da Conta
Código do Banco

 */