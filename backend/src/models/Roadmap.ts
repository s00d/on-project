import { Model, DataTypes, ForeignKey, NonAttribute } from 'sequelize'
import { sequelize } from '../sequelize'
import { Project } from './Project'

class Roadmap extends Model {
  public id!: number
  public title!: string
  public description!: string
  public createdAt!: Date
  public updatedAt!: Date

  declare projectId: ForeignKey<Project['id']>
  declare project?: NonAttribute<Project>
}

Roadmap.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    projectId: {
      type: DataTypes.INTEGER,
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
    tableName: 'roadmaps',
    timestamps: true,
    indexes: [{ fields: ['projectId'] }, { fields: ['createdAt'] }, { fields: ['updatedAt'] }]
  }
)

export { Roadmap }
