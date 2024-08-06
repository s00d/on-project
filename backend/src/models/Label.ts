import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../sequelize'

class Label extends Model {
  public id!: number
  public name!: string
  public color!: string
  public createdAt!: Date
  public updatedAt!: Date
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
