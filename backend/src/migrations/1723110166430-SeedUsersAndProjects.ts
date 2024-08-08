import { MigrationInterface, QueryRunner } from "typeorm";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { User } from "../models/User";
import { Project } from "../models/Project";
import { ProjectUser } from "../models/ProjectUser";
import { Task } from "../models/Task";

export class SeedUsersAndProjects1723110166430 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const userRepository = queryRunner.connection.getRepository(User);
        const projectRepository = queryRunner.connection.getRepository(Project);
        const projectUserRepository = queryRunner.connection.getRepository(ProjectUser);
        const taskRepository = queryRunner.connection.getRepository(Task);

        // Creating users
        const users = [
            {
                username: 'user1',
                email: 'user1@example.com',
                password: await bcrypt.hash('password1', 10),
                apikey: uuidv4(),
            },
            {
                username: 'user2',
                email: 'user2@example.com',
                password: await bcrypt.hash('password2', 10),
                apikey: uuidv4(),
            },
            {
                username: 'user3',
                email: 'user3@example.com',
                password: await bcrypt.hash('password3', 10),
                apikey: uuidv4(),
            },
        ];

        const userEntities = userRepository.create(users);
        await userRepository.save(userEntities);

        // Assuming the first user is the project owner
        const project = projectRepository.create({
            name: 'Test Project',
            description: 'This is a test project',
            owner: userEntities[0],
            customFields: JSON.stringify([
                { name: 'Field1', description: 'Custom Field 1', type: 'text' },
            ]),
        });

        await projectRepository.save(project);

        // Adding users to the project
        for (const user of userEntities) {
            const projectUser = projectUserRepository.create({
                project: project,
                user: user,
                active: true,
            } as Partial<ProjectUser>);
            await projectUserRepository.save(projectUser);
        }

        // Creating tasks for the project
        for (let i = 1; i <= 100; i++) {
            const task = taskRepository.create({
                title: `Task ${i}`,
                description: `This is task number ${i}`,
                status: ['To Do', 'In Progress', 'Done'][Math.floor(Math.random() * 3)],
                project: project,
                assignees: [userEntities[Math.floor(Math.random() * userEntities.length)]],
                dueDate: new Date(new Date().setDate(new Date().getDate() + i)),
                priority: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
                estimatedTime: Math.floor(Math.random() * 10) + 1,
                type: 'Task',
                plannedDate: new Date(new Date().setDate(new Date().getDate() + i)),
                actualTime: Math.floor(Math.random() * 10) + 1,
                tags: ['tag1', 'tag2'],
                customFields: {},
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await taskRepository.save(task);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM tasks`);
        await queryRunner.query(`DELETE FROM project_users`);
        await queryRunner.query(`DELETE FROM projects`);
        await queryRunner.query(`DELETE FROM users`);
    }

}
