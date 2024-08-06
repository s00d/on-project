import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../sequelize';

class Role extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Role.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
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
  tableName: 'roles',
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['createdAt'] },
    { fields: ['updatedAt'] },
  ],
});

const roles = [
  { name: 'Admin', description: 'Full access to all resources' },
  { name: 'User', description: 'Basic access to the application' },
  { name: 'Project Manager', description: 'Manage projects and tasks' },
  { name: 'Developer', description: 'Can create and update tasks' },
  { name: 'Task:Read', description: 'Can read tasks' },
  { name: 'Task:Create', description: 'Can create tasks' },
  { name: 'Task:Update', description: 'Can update tasks' },
  { name: 'Task:Delete', description: 'Can delete tasks' },
  { name: 'Comment:Read', description: 'Can read comments' },
  { name: 'Comment:Create', description: 'Can create comments' },
  { name: 'Comment:Update', description: 'Can update comments' },
  { name: 'Comment:Delete', description: 'Can delete comments' },
  { name: 'ImportExport:Import', description: 'Can import data' },
  { name: 'ImportExport:Export', description: 'Can export data' },
  { name: 'ImportExport:GitHubImport', description: 'Can import data from GitHub' },
  { name: 'Label:Read', description: 'Can read labels' },
  { name: 'Label:Create', description: 'Can create labels' },
  { name: 'Label:Update', description: 'Can update labels' },
  { name: 'Label:Delete', description: 'Can delete labels' },
  { name: 'Notification:Read', description: 'Can read notifications' },
  { name: 'Notification:Update', description: 'Can update notifications' },
  { name: 'Project:Read', description: 'Can read projects' },
  { name: 'Project:Create', description: 'Can create projects' },
  { name: 'Project:Update', description: 'Can update projects' },
  { name: 'Project:Delete', description: 'Can delete projects' },
  { name: 'Project:Invite', description: 'Can invite users to projects' },
  { name: 'Project:ReadUsers', description: 'Can read project users' },
  { name: 'Project:AddUser', description: 'Can add users to projects' },
  { name: 'Project:RemoveUser', description: 'Can remove users from projects' },
  { name: 'Report:Generate', description: 'Can generate reports' },
  { name: 'Report:GeneratePriority', description: 'Can generate priority reports' },
  { name: 'Report:GenerateOverdue', description: 'Can generate overdue reports' },
  { name: 'Report:GeneratePerformance', description: 'Can generate performance reports' },
  { name: 'Report:GeneratePriorityDistribution', description: 'Can generate priority distribution reports' },
  { name: 'Report:GenerateProgress', description: 'Can generate progress reports' },
  { name: 'Report:GenerateWorkload', description: 'Can generate workload reports' },
  { name: 'Roadmap:Read', description: 'Can read roadmaps' },
  { name: 'Roadmap:Create', description: 'Can create roadmaps' },
  { name: 'Roadmap:Update', description: 'Can update roadmaps' },
  { name: 'Roadmap:Delete', description: 'Can delete roadmaps' },
  { name: 'Role:Read', description: 'Can read roles' },
  { name: 'Role:Create', description: 'Can create roles' },
  { name: 'Role:Assign', description: 'Can assign roles' },
  { name: 'Role:ReadPermissions', description: 'Can read role permissions' },
  { name: 'Role:CreatePermission', description: 'Can create role permissions' },
  { name: 'Sprint:Read', description: 'Can read sprints' },
  { name: 'Sprint:Create', description: 'Can create sprints' },
  { name: 'Sprint:Update', description: 'Can update sprints' },
  { name: 'Sprint:Delete', description: 'Can delete sprints' },
  { name: 'TaskAttachment:Read', description: 'Can read task attachments' },
  { name: 'TaskAttachment:Create', description: 'Can create task attachments' },
  { name: 'TaskAttachment:Delete', description: 'Can delete task attachments' },
  { name: 'TaskHistory:Read', description: 'Can read task history' },
  { name: 'TaskTemplate:Read', description: 'Can read task templates' },
  { name: 'TaskTemplate:Create', description: 'Can create task templates' },
  { name: 'TaskTemplate:Delete', description: 'Can delete task templates' },
];

const createDefaultRoles = async () => {
  for (const roleData of roles) {
    const role = await Role.findOne({ where: { name: roleData.name } });
    if (!role) {
      await Role.create(roleData);
      console.log(`Role ${roleData.name} created`);
    }
  }
};

const getDefaultUserRoles = async () => {
  return [
    'User',
    'Task:Read',
    'Task:Create',
    'Task:Update',
    'Task:Delete',
    'Comment:Read',
    'Comment:Create',
    'Comment:Update',
    'Comment:Delete',
    'Label:Read',
    'Label:Create',
    'Label:Update',
    'Label:Delete',
    'Notification:Read',
    'Notification:Update',
    'Project:Read',
    'Report:Generate',
    'Report:GeneratePriority',
    'Report:GenerateOverdue',
    'Report:GeneratePerformance',
    'Report:GeneratePriorityDistribution',
    'Report:GenerateProgress',
    'Report:GenerateWorkload',
    'Roadmap:Read',
    'Sprint:Read',
    'TaskAttachment:Read',
    'TaskAttachment:Create',
    'TaskAttachment:Delete',
    'TaskHistory:Read',
    'TaskTemplate:Read',
    'TaskTemplate:Create',
    'TaskTemplate:Delete'
  ];
};

export { Role, createDefaultRoles, getDefaultUserRoles };
