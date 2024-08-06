import { Model, DataTypes, ForeignKey, NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize';
import { User } from './User';

class Notification extends Model {
  public id!: number;
  declare userId: ForeignKey<User['id']>;
  public message!: string;
  public read!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  declare user?: NonAttribute<User>;
}

Notification.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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
  timestamps: true,
  tableName: 'notifications',
  indexes: [
    { fields: ['userId'] },
    { fields: ['createdAt'] },
    { fields: ['updatedAt'] },
  ],
});

export { Notification };
