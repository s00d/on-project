import { Model, DataTypes, ForeignKey, NonAttribute } from 'sequelize'
import { sequelize } from '../sequelize'
import { User } from './User'

class TaskTemplate extends Model {
  public id!: number
  declare userId: ForeignKey<User['id']>
  public title!: string
  public description!: string
  public priority!: string
  public createdAt!: Date
  public updatedAt!: Date

  declare user?: NonAttribute<User>
}

TaskTemplate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Medium'
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
    tableName: 'task_templates',
    indexes: [{ fields: ['userId'] }, { fields: ['createdAt'] }, { fields: ['updatedAt'] }]
  }
)

export { TaskTemplate }
