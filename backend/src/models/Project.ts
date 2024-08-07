import { Model, DataTypes, ForeignKey, NonAttribute } from 'sequelize'
import { sequelize } from '../sequelize'
import { User } from './User'
import { Task } from './Task'

class Project extends Model {
  public id!: number
  public name!: string
  public description!: string
  public savedFilters!: { name: string; filters: any }[];
  public customFields!: { name: string; description: string; type: string }[];
  public priorities!: string[]
  public statuses!: string[]
  public tags!: string[]
  public types!: string[]
  declare ownerId: ForeignKey<User['id']>
  public createdAt!: Date
  public updatedAt!: Date

  declare owner?: NonAttribute<User>
  declare tasks?: NonAttribute<Task[]>
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    savedFilters: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('savedFilters');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(val: { name: string; filters: any }[]) {
        this.setDataValue('savedFilters', JSON.stringify(val));
      },
    },
    customFields: {
      type: DataTypes.TEXT, // Хранить в виде строки
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('customFields');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(val: { name: string; description: string; type: string }[]) {
        this.setDataValue('customFields', JSON.stringify(val));
      },
    },
    priorities: {
      type: DataTypes.TEXT,
      defaultValue: '["Low", "Medium", "High"]',
      get() {
        const rawValue = this.getDataValue('priorities')
        return rawValue ? JSON.parse(rawValue) : []
      },
      set(val: string[]) {
        this.setDataValue('priorities', JSON.stringify(val))
      },
    },
    statuses: {
      type: DataTypes.TEXT,
      defaultValue: '["To Do", "In Progress", "Done"]',
      get() {
        const rawValue = this.getDataValue('statuses')
        return rawValue ? JSON.parse(rawValue) : []
      },
      set(val: string[]) {
        this.setDataValue('statuses', JSON.stringify(val))
      },
    },
    tags: {
      type: DataTypes.TEXT,
      defaultValue: '["tag1", "tag2"]',
      get() {
        const rawValue = this.getDataValue('tags')
        return rawValue ? JSON.parse(rawValue) : []
      },
      set(val: string[]) {
        this.setDataValue('tags', JSON.stringify(val))
      },
    },
    types: {
      type: DataTypes.TEXT,
      defaultValue: '["Frontend", "Backend", "Test", "Deploy", "Mixed"]',
      get() {
        const rawValue = this.getDataValue('types')
        return rawValue ? JSON.parse(rawValue) : []
      },
      set(val: string[]) {
        this.setDataValue('types', JSON.stringify(val))
      },
    },
    ownerId: {
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
    tableName: 'projects',
    timestamps: true,
    indexes: [{ fields: ['ownerId'] }, { fields: ['createdAt'] }, { fields: ['updatedAt'] }]
  }
)

export { Project }
