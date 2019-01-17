import { IsAlphanumeric, validate, IsInt, IsEnum, IsNotEmpty, IsNumber, IsUUID } from "class-validator";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, Timestamp } from "typeorm";
import { User, Payment } from ".";


@Entity(Asset.tableName)
export default class Asset extends BaseEntity {
  public static readonly tableName = "entities";

  @IsNotEmpty()
  @IsUUID()
  @Column({ nullable: false, primary: true, unique: true })
  id: number;

  @IsNotEmpty()
  @IsAlphanumeric()
  @Column({ nullable: false })
  code: string;

  @IsNotEmpty()
  @IsAlphanumeric()
  @Column({ nullable: false })
  name: string;

  @IsUUID()
  @IsAlphanumeric()
  @Column({ nullable: false })
  wallet: number;

  constructor(data: Partial<Asset>) {
    super();
    Object.assign(this, data, {});
  }

  public static async getAssetById(id: string) {
    return await this.findOne({ where: { id } });
  }
}