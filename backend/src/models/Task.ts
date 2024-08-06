import { Model, DataTypes, ForeignKey, NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize';
import { User } from './User';
import { Project } from './Project';
import { Label } from './Label';
import { Comment } from './Comment';

class Task extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public status!: string;
  declare projectId: ForeignKey<Project['id']>;
  declare assigneeId: ForeignKey<User['id']>;
  declare labelId: ForeignKey<Label['id']>;
  public dueDate!: Date;
  public priority!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  declare comments?: NonAttribute<Comment[]>;
  declare assignee?: NonAttribute<User>;
  declare label?: NonAttribute<Label>;
}

Task.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assigneeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  labelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  priority: {
    type: DataTypes.STRING(128),
    allowNull: true,
    defaultValue: 'Medium',
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
  tableName: 'tasks',
  timestamps: true,
  indexes: [
    { fields: ['projectId'] },
    { fields: ['assigneeId'] },
    { fields: ['labelId'] },
    { fields: ['createdAt'] },
    { fields: ['updatedAt'] },
  ],
});

export { Task };
