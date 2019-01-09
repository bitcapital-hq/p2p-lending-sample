import { IsAlphanumeric, validate, IsBoolean, IsInt, IsEnum, IsNotEmpty } from "class-validator";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from ".";

export enum ProposalStatus {
  PENDING = "pending",
  OPEN = "open",
  CLOSE = "close"
}

@Entity(Proposal.tableName)
export default class Proposal extends BaseEntity {
  public static readonly tableName = 'proposals';

  @PrimaryGeneratedColumn("uuid")
  id: number;

  @IsAlphanumeric()
  @Column({ nullable: false, type: 'float' })
  amount: number;

  @IsAlphanumeric()
  @Column({ nullable: false, type: 'float' })
  interest: number

  @IsEnum(ProposalStatus)
  @Column("enum", { enum: ProposalStatus, default: ProposalStatus.PENDING, nullable: false })
  status: Proposal

  @IsNotEmpty()
  @ManyToOne(type => User, owner => owner.id, { onDelete: "CASCADE", nullable: false })
  owner: User;

  constructor(data: Partial<User>) {
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
 Proposta de Empréstimo
Status
Pendente
Aberta
Fechada
Número mínimo de parcelas
Número máximo de parcelas


Pagamentos

 */