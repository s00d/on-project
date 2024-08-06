import {Model, DataTypes, NonAttribute, ForeignKey} from 'sequelize';
import { sequelize } from '../sequelize';
import { User } from './User';
import { Task } from './Task';

class TaskHistory extends Model {
  public id!: number;
  declare taskId: ForeignKey<Task['id']>;
  declare userId: ForeignKey<User['id']>;
  public action!: string;
  public timestamp!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;

  declare task?: NonAttribute<Task>;
  declare user?: NonAttribute<User>;
}

TaskHistory.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action: {
    type: new DataTypes.STRING(128),
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
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
  tableName: 'task_histories',
  timestamps: true,
  indexes: [
    { fields: ['createdAt'] },
    { fields: ['updatedAt'] },
  ],
});


export { TaskHistory };
