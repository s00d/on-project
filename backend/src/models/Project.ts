import { Model, DataTypes, ForeignKey, NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize';
import { User } from './User';
import { Task } from './Task';

class Project extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  declare ownerId: ForeignKey<User['id']>;
  public createdAt!: Date;
  public updatedAt!: Date;

  declare owner?: NonAttribute<User>;
  declare tasks?: NonAttribute<Task[]>;
}

Project.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ownerId: {
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
  tableName: 'projects',
  timestamps: true,
  indexes: [
    { fields: ['ownerId'] },
    { fields: ['createdAt'] },
    { fields: ['updatedAt'] },
  ],
});

export { Project };
