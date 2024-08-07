import { Model, DataTypes, ForeignKey, NonAttribute } from 'sequelize'
import { sequelize } from '../sequelize'
import { User } from './User'
import { Project } from './Project'
import { Label } from './Label'
import { Comment } from './Comment'

class Task extends Model {
  public id!: number
  public title!: string
  public description!: string
  public status!: string
  declare projectId: ForeignKey<Project['id']>
  declare assigneeId: ForeignKey<User['id']>
  declare labelId: ForeignKey<Label['id']>
  public dueDate!: Date
  public priority!: string

  public estimatedTime!: number // Новое поле для оценочного времени
  public actualTime!: number
  public type!: string // Новое поле для типа задачи
  public plannedDate!: Date // Новое поле для плановой даты
  declare relatedTaskId: ForeignKey<Task['id']> // Новое поле для связанной задачи
  public tags!: string[] // Поле для массивов тегов
  public customFields!: { [name: string]: string };
  public createdAt!: Date
  public updatedAt!: Date

  declare Comments?: NonAttribute<Comment[]>
  declare Assignee?: NonAttribute<User>
  declare Label?: NonAttribute<Label>
  declare RelatedTask?: NonAttribute<Task>
}

Task.init(
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
    status: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assigneeId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    labelId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    priority: {
      type: DataTypes.STRING(128),
      allowNull: true,
      defaultValue: 'Medium'
    },
    estimatedTime: {
      type: DataTypes.INTEGER, // Время в минутах
      allowNull: true
    },
    actualTime: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    plannedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    relatedTaskId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tags: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('tags')
        return rawValue ? rawValue.split(',') : []
      },
      set(val: string[]) {
        this.setDataValue('tags', val.join(','))
      }
    },
    customFields: {
      type: DataTypes.TEXT, // Хранить в виде строки
      defaultValue: '{}',
      get() {
        const rawValue = this.getDataValue('customFields');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(val: { name: string; value: string }[]) {
        this.setDataValue('customFields', JSON.stringify(val));
      },
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
    tableName: 'tasks',
    timestamps: true,
    indexes: [
      { fields: ['projectId'] },
      { fields: ['assigneeId'] },
      { fields: ['relatedTaskId'] },
      { fields: ['labelId'] },
      { fields: ['createdAt'] },
      { fields: ['updatedAt'] }
    ]
  }
)

export { Task }
