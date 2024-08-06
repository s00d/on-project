import { Model, DataTypes, ForeignKey } from 'sequelize';
import { sequelize } from '../sequelize';
import { User } from './User';
import { Role } from './Role';
import { Project } from './Project';

class UserRole extends Model {
  declare roleId: ForeignKey<Role['id']>;
  declare userId: ForeignKey<User['id']>;
  declare projectId: ForeignKey<Project['id']>;
  public createdAt!: Date;
  public updatedAt!: Date;

  declare role?: Role;
  declare user?: User;
  declare project?: Project;
}

UserRole.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  projectId: {
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
  tableName: 'user_roles',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['roleId'] },
    { fields: ['projectId'] },
    { fields: ['createdAt'] },
    { fields: ['updatedAt'] },
  ],
});

export { UserRole };
