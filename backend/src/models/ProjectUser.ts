import { Model, DataTypes, ForeignKey, NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize';
import { User } from './User';
import { Project } from './Project';

class ProjectUser extends Model {
  declare projectId: ForeignKey<Project['id']>;
  declare userId: ForeignKey<User['id']>;
  public createdAt!: Date;
  public updatedAt!: Date;

  declare project?: NonAttribute<Project>;
  declare user?: NonAttribute<User>;
}

ProjectUser.init({
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  sequelize,
  tableName: 'project_users',
  timestamps: true,
  indexes: [
    { fields: ['projectId'] },
    { fields: ['userId'] },
    { fields: ['createdAt'] },
    { fields: ['updatedAt'] },
  ],
});

export { ProjectUser };
