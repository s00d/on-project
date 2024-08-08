import { Model, DataTypes, ForeignKey, NonAttribute } from 'sequelize'
import { sequelize } from '../sequelize'
import { User } from './User'
import { Project } from './Project'

class ProjectUser extends Model {
  declare projectId: ForeignKey<Project['id']>
  declare userId: ForeignKey<User['id']>
  declare active: boolean
  public createdAt!: Date
  public updatedAt!: Date

  declare Project?: NonAttribute<Project>
  declare User?: NonAttribute<User>
}

ProjectUser.init(
  {
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    tableName: 'project_users',
    timestamps: true,
    indexes: [
      { fields: ['projectId'] },
      { fields: ['userId'] },
      { fields: ['createdAt'] },
      { fields: ['updatedAt'] }
    ],
    defaultScope: {
      where: {
        active: true
      }
    }
  }
)

export { ProjectUser }
