import { sequelize } from '../sequelize'
import { User } from './User'
import { Project } from './Project'
import { Task } from './Task'
import { Comment } from './Comment'
import { Label } from './Label'
import { Notification } from './Notification'
import { ProjectUser } from './ProjectUser'
import { Roadmap } from './Roadmap'
import { Sprint } from './Sprint'
import { TaskHistory } from './TaskHistory'
import { TaskAttachment } from './TaskAttachment'
import { TaskTemplate } from './TaskTemplate'

// Устанавливаем ассоциации
User.hasMany(Project, { foreignKey: 'ownerId' })
User.hasMany(Notification, { foreignKey: 'userId' })
User.hasMany(Comment, { foreignKey: 'userId' })
User.belongsToMany(Project, { through: ProjectUser, foreignKey: 'userId' })

Project.belongsTo(User, { foreignKey: 'ownerId' })
Project.hasMany(Task, { foreignKey: 'projectId' })
Project.hasMany(ProjectUser, { foreignKey: 'projectId' })
Project.hasMany(Roadmap, { foreignKey: 'projectId' })
Project.belongsToMany(User, { through: ProjectUser, foreignKey: 'projectId' })

Task.hasMany(Comment, { foreignKey: 'taskId' })
Task.belongsTo(Project, { foreignKey: 'projectId' })
Task.belongsTo(Label, { foreignKey: 'labelId' })
Task.belongsTo(Task, { as: 'relatedTask', foreignKey: 'relatedTaskId' })

Comment.belongsTo(User, { foreignKey: 'userId' })
Comment.belongsTo(Task, { foreignKey: 'taskId' })

Notification.belongsTo(User, { foreignKey: 'userId' })

ProjectUser.belongsTo(User, { foreignKey: 'userId' })
ProjectUser.belongsTo(Project, { foreignKey: 'projectId' })

Label.belongsTo(User, { foreignKey: 'userId' })
Label.belongsTo(Project, { foreignKey: 'projectId' })


Roadmap.belongsTo(Project, { foreignKey: 'projectId' })
Roadmap.hasMany(Sprint, { foreignKey: 'roadmapId' })

Sprint.belongsTo(Roadmap, { foreignKey: 'roadmapId' })

TaskHistory.belongsTo(User, { foreignKey: 'userId' })
TaskHistory.belongsTo(Task, { foreignKey: 'taskId' })

TaskAttachment.belongsTo(Task, { foreignKey: 'taskId' })

export {
  sequelize,
  User,
  Project,
  Task,
  Comment,
  Label,
  Notification,
  ProjectUser,
  Roadmap,
  Sprint,
  TaskHistory,
  TaskAttachment,
  TaskTemplate
}
