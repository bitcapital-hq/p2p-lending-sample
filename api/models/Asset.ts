import { IsAlphanumeric, IsNotEmpty, IsUUID } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AppEntity } from ".";


@Entity(Asset.tableName)
export default class Asset extends AppEntity {
  public static readonly tableName = "assets";

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