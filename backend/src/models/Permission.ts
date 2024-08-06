import { Model, DataTypes, ForeignKey, NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize';
import { Role } from './Role';
import {Project} from "./Project";

class Permission extends Model {
  public id!: number;
  declare roleId: ForeignKey<Role['id']>;
  declare projectId: ForeignKey<Project['id']>;
  public entity!: string;
  public action!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  declare role?: NonAttribute<Role>;
  declare project?: NonAttribute<Project>;
}

Permission.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  entity: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(128),
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
  tableName: 'permissions',
  timestamps: true,
  indexes: [
    { fields: ['roleId'] },
    { fields: ['createdAt'] },
    { fields: ['updatedAt'] },
  ],
});

export { Permission };
