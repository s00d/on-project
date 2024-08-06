import { Model, DataTypes, ForeignKey, NonAttribute } from 'sequelize'
import { sequelize } from '../sequelize'
import { User } from './User'
import { Task } from './Task'

class Comment extends Model {
  public id!: number
  public content!: string
  public attachment!: string | null
  declare taskId: ForeignKey<Task['id']>
  declare userId: ForeignKey<User['id']>
  public createdAt!: Date
  public updatedAt!: Date

  declare task?: NonAttribute<Task>
  declare user?: NonAttribute<User>
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    attachment: {
      type: DataTypes.STRING,
      allowNull: true
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
    tableName: 'comments',
    indexes: [
      { fields: ['taskId'] },
      { fields: ['userId'] },
      { fields: ['createdAt'] },
      { fields: ['updatedAt'] }
    ]
  }
)

export { Comment }
