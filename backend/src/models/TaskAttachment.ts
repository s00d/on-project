import {Model, DataTypes, ForeignKey, NonAttribute} from 'sequelize';
import { sequelize } from '../sequelize';
import { Task } from './Task';

class TaskAttachment extends Model {
  public id!: number;
  declare taskId: ForeignKey<Task['id']>;
  public filename!: string;
  public filePath!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  declare task?: NonAttribute<Task>;
}

TaskAttachment.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  filename: {
    type: new DataTypes.STRING(128),
    allowNull: false,
  },
  filePath: {
    type: new DataTypes.STRING(255),
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
  tableName: 'task_attachments',
  timestamps: true,
  indexes: [
    { fields: ['createdAt'] },
    { fields: ['updatedAt'] },
  ],
});


export { TaskAttachment };
