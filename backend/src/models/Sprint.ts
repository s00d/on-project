import { Model, DataTypes, ForeignKey, NonAttribute } from 'sequelize'
import { sequelize } from '../sequelize'
import { Roadmap } from './Roadmap'

class Sprint extends Model {
  public id!: number
  public title!: string
  public description!: string
  public startDate!: Date
  public endDate!: Date
  declare roadmapId: ForeignKey<Roadmap['id']>
  public createdAt!: Date
  public updatedAt!: Date

  declare roadmap?: NonAttribute<Roadmap>
}

Sprint.init(
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
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    roadmapId: {
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
    tableName: 'sprints',
    timestamps: true,
    indexes: [{ fields: ['roadmapId'] }, { fields: ['createdAt'] }, { fields: ['updatedAt'] }]
  }
)

export { Sprint }
