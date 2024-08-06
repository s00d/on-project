import { sequelize } from '../sequelize';
import { User } from './User';
import { Role } from './Role';
import { Project } from './Project';
import { UserRole } from './UserRole';
import { Task } from './Task';
import { Comment } from './Comment';
import { Label } from './Label';
import { Notification } from './Notification';
import { Permission } from './Permission';
import { ProjectUser } from './ProjectUser';
import { Roadmap } from './Roadmap';
import { Sprint } from './Sprint';
import {TaskHistory} from "./TaskHistory";
import {TaskAttachment} from "./TaskAttachment";
import {TaskTemplate} from "./TaskTemplate";

// Устанавливаем ассоциации
User.hasMany(Project, { foreignKey: 'ownerId' });
User.hasMany(UserRole, { foreignKey: 'userId' });
User.hasMany(Notification, { foreignKey: 'userId' });
User.hasMany(Comment, { foreignKey: 'userId' });

Role.hasMany(UserRole, { foreignKey: 'roleId' });
Role.hasMany(Permission, { foreignKey: 'roleId' });

Project.hasMany(UserRole, { foreignKey: 'projectId' });
Project.hasMany(Task, { foreignKey: 'projectId' });
Project.hasMany(ProjectUser, { foreignKey: 'projectId' });
Project.hasMany(Roadmap, { foreignKey: 'projectId' });

Task.hasMany(Comment, { foreignKey: 'taskId' });
Task.belongsTo(User, { foreignKey: 'assigneeId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });
Task.belongsTo(Label, { foreignKey: 'labelId' });

UserRole.belongsTo(User, { foreignKey: 'userId' });
UserRole.belongsTo(Role, { foreignKey: 'roleId' });
UserRole.belongsTo(Project, { foreignKey: 'projectId' });

Comment.belongsTo(User, { foreignKey: 'userId' });
Comment.belongsTo(Task, { foreignKey: 'taskId' });

Notification.belongsTo(User, { foreignKey: 'userId' });

Permission.belongsTo(Role, { foreignKey: 'roleId' });
Permission.belongsTo(Project, { foreignKey: 'projectId' });

ProjectUser.belongsTo(User, { foreignKey: 'userId' });
ProjectUser.belongsTo(Project, { foreignKey: 'projectId' });

Roadmap.belongsTo(Project, { foreignKey: 'projectId' });
Roadmap.hasMany(Sprint, { foreignKey: 'roadmapId' });

Sprint.belongsTo(Roadmap, { foreignKey: 'roadmapId' });

TaskHistory.belongsTo(User, { foreignKey: 'userId' });
TaskHistory.belongsTo(Task, { foreignKey: 'taskId' });

TaskAttachment.belongsTo(Task, { foreignKey: 'taskId' });

export {
  sequelize,
  User,
  Role,
  Project,
  UserRole,
  Task,
  Comment,
  Label,
  Notification,
  Permission,
  ProjectUser,
  Roadmap,
  Sprint,
  TaskHistory,
  TaskAttachment,
  TaskTemplate,
};
