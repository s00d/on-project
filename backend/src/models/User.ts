import {Model, DataTypes, NonAttribute} from 'sequelize';
import { sequelize } from '../sequelize';
import {Task} from "./Task";
import {Project} from "./Project";

class User extends Model {
  public id!: number;
  public apikey!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public twoFactorEnabled!: boolean;
  public twoFactorSecret!: string | null;
  public resetPasswordToken!: string | null;
  public resetPasswordExpires!: Date | null;
  public createdAt!: Date;
  public updatedAt!: Date;

  declare project?: NonAttribute<Project>;
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  apikey: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true,
  },
  username: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  twoFactorSecret: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
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
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['apikey'] },
    { fields: ['username'] },
    { fields: ['email'] },
    { fields: ['createdAt'] },
    { fields: ['updatedAt'] },
  ],
});


export { User };
