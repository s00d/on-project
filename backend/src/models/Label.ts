import {Model, DataTypes, ForeignKey, NonAttribute} from 'sequelize'
import { sequelize } from '../sequelize'
import {Project} from "./Project";
import {User} from "./User";

class Label extends Model {
  public id!: number
  declare projectId: ForeignKey<Project['id']>
  declare userId: ForeignKey<User['id']>
  public name!: string
  public color!: string
  public createdAt!: Date
  public updatedAt!: Date

  declare Project?: NonAttribute<Project>
  declare User?: NonAttribute<User>
}

Label.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    timestamps: true,
    tableName: 'labels',
    indexes: [{ fields: ['createdAt'] }, { fields: ['updatedAt'] }]
  }
)

export { Label }
