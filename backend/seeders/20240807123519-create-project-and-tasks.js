'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid'; // for generating unique task IDs

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Assuming the user with id 1 already exists
    const userId = 1;

    // Create a project for the user
    const [project] = await queryInterface.bulkInsert(
      'Projects',
      [
        {
          name: 'Test Project',
          description: 'This is a test project',
          ownerId: userId,
          customFields: JSON.stringify([
            { name: 'Field1', description: 'Custom Field 1', type: 'text' },
          ]),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: true }
    );

    // Generate 100 tasks for the project
    const tasks = [];
    for (let i = 1; i <= 100; i++) {
      tasks.push({
        title: `Task ${i}`,
        description: `This is task number ${i}`,
        status: ['To Do', 'In Progress', 'Done'][Math.floor(Math.random() * 3)],
        projectId: project.id,
        assigneeId: userId,
        labelId: null,
        dueDate: new Date(new Date().setDate(new Date().getDate() + i)),
        priority: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        estimatedTime: Math.floor(Math.random() * 10) + 1,
        type: 'Task',
        plannedDate: new Date(new Date().setDate(new Date().getDate() + i)),
        relatedTaskId: null,
        actualTime: Math.floor(Math.random() * 10) + 1,
        tags: JSON.stringify(['tag1', 'tag2']),
        customFields: JSON.stringify({}),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert('Tasks', tasks);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Tasks', null, {});
    await queryInterface.bulkDelete('Projects', null, {});
  },
};
