import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { Project } from '../models/Project';
import {Task} from "../models/Task";


const generateReport = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { startDate, user = 'all' } = req.query;

  try {
    const projectRepository = AppDataSource.getRepository(Project);

    // Создаем QueryBuilder для получения данных с фильтрацией на уровне БД
    const queryBuilder = projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .where('project.id = :projectId', { projectId: parseInt(projectId) });

    // Фильтрация по дате обновления задач
    if (startDate) {
      queryBuilder.andWhere('task.updatedAt >= :startDate', { startDate: new Date(startDate as string) });
    }

    // Фильтрация по пользователю, если указан
    if (user !== 'all') {
      queryBuilder.andWhere('assignee.id = :userId', { userId: parseInt(user as string) });
    }

    const project = await queryBuilder.getOne();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = project.tasks;

    const completedTasks = tasks.filter(task => task.status === 'Done').length;
    const totalTasks = tasks.length;

    const taskStatusDistribution = tasks.reduce((acc: Record<string, number>, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    const report = {
      project: project.name,
      description: project.description,
      completedTasks,
      totalTasks,
      taskStatusDistribution
    };

    res.json(report);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};



const generatePriorityReport = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { user = 'all', startDate } = req.query;

  try {
    const projectRepository = AppDataSource.getRepository(Project);

    const queryBuilder = projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .where('project.id = :projectId', { projectId: parseInt(projectId) });

    // Фильтрация по дате создания задачи
    if (startDate) {
      queryBuilder.andWhere('task.createdAt >= :startDate', { startDate: new Date(startDate.toString()) });
    }

    // Фильтрация по назначенному пользователю, если указан
    if (user !== 'all') {
      queryBuilder.andWhere('assignee.id = :userId', { userId: parseInt(user as string) });
    }

    const project = await queryBuilder.getOne();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const reportData = project.tasks.reduce((acc: Record<string, number>, task: Task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    res.json(reportData);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


const generateOverdueReport = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { startDate } = req.query;

  try {
    const projectRepository = AppDataSource.getRepository(Project);

    // Получаем задачи с помощью QueryBuilder
    const queryBuilder = projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .where('project.id = :projectId', { projectId: parseInt(projectId) })
      .andWhere('task.dueDate IS NOT NULL')
      .andWhere('task.dueDate < :now', { now: new Date() })
      .andWhere('task.status != :status', { status: 'Done' });


    if (startDate) {
      queryBuilder.andWhere('task.createdAt >= :startDate', { startDate: new Date(startDate.toString()) });
    }

    const project = await queryBuilder.getOne();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const overdueData = project.tasks.reduce((acc, task) => {
      const date = new Date(task.dueDate!).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += 1;
      return acc;
    }, {} as Record<string, number>);

    res.json(overdueData);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


const generateTeamPerformanceReport = async (req: Request, res: Response) => {
  const {projectId} = req.params;
  const {startDate} = req.query;

  try {
    const projectRepository = AppDataSource.getRepository(Project);

    // Используем QueryBuilder для выполнения фильтрации на уровне базы данных
    const queryBuilder = projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .where('project.id = :projectId', {projectId: parseInt(projectId)})

    if (startDate) {
      queryBuilder.andWhere('task.createdAt >= :startDate', {startDate: new Date(startDate.toString())});
    }

    const project = await queryBuilder.getOne();

    if (!project) {
      return res.status(404).json({error: 'Project not found'});
    }

    const performance = project.tasks.reduce(
      (acc, task) => {
        task.assignees.forEach((assignee) => {
          acc[assignee.id] = acc[assignee.id] || {total: 0, completed: 0};
          acc[assignee.id].total += 1;
          if (task.status === 'Done') {
            acc[assignee.id].completed += 1;
          }
        });
        return acc;
      },
      {} as Record<number, { total: number; completed: number }>
    );

    res.json(performance);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
}

const generatePriorityDistributionReport = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { period = 'all', user = 'all', type = 'priority', startDate } = req.query;

  try {
    const projectRepository = AppDataSource.getRepository(Project);

    // Используем QueryBuilder для выполнения фильтрации на уровне базы данных
    const queryBuilder = projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .where('project.id = :projectId', { projectId: parseInt(projectId) });

    // Фильтрация по дате создания задачи
    if (startDate) {
      queryBuilder.andWhere('task.createdAt >= :startDate', { startDate: new Date(startDate.toString()) });
    }

    // Фильтрация по назначенному пользователю, если указан
    if (user !== 'all') {
      queryBuilder.andWhere('assignee.id = :userId', { userId: parseInt(user.toString()) });
    }

    const project = await queryBuilder.getOne();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const reportData = project.tasks.reduce(
      (acc: Record<string, number>, task: Task) => {
        const key = type === 'priority' ? task.priority : task.status;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {}
    );

    res.json(reportData);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const generateProgressReport = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { startDate } = req.query;

  try {
    const projectRepository = AppDataSource.getRepository(Project);

    // Используем QueryBuilder для выполнения фильтрации на уровне базы данных
    const queryBuilder = projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .where('project.id = :projectId', { projectId: parseInt(projectId) });

    if (startDate) {
      queryBuilder.andWhere('task.createdAt >= :startDate', { startDate: new Date(startDate.toString()) });
    }

    const project = await queryBuilder.getOne();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const progress = project.tasks.reduce(
      (acc, task) => {
        const date = new Date(task.updatedAt).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { total: 0, completed: 0 };
        }
        acc[date].total += 1;
        if (task.status === 'Done') {
          acc[date].completed += 1;
        }
        return acc;
      },
      {} as Record<string, { total: number; completed: number }>
    );

    res.json(progress);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


const generateTeamWorkloadReport = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { startDate } = req.query;

  try {
    const projectRepository = AppDataSource.getRepository(Project);

    // Используем QueryBuilder для выполнения фильтрации на уровне базы данных
    const queryBuilder = projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .where('project.id = :projectId', { projectId: parseInt(projectId) })

    if (startDate) {
      queryBuilder.andWhere('task.createdAt >= :startDate', { startDate: new Date(startDate.toString()) });
    }

    const project = await queryBuilder.getOne();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const workload = project.tasks.reduce(
      (acc, task) => {
        task.assignees.forEach((assignee) => {
          acc[assignee.id] = (acc[assignee.id] || 0) + 1;
        });
        return acc;
      },
      {} as Record<number, number>
    );

    res.json(workload);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


const generateUniversalReport = async (req: Request, res: Response) => {
  const modelFields = {
    Task: ['id', 'title', 'status', 'priority', 'dueDate', 'createdAt', 'updatedAt', 'type', 'tags'],
    User: ['id', 'username', 'email', 'createdAt', 'updatedAt'],
    Project: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
    Sprint: ['id', 'title', 'startDate', 'endDate', 'createdAt', 'updatedAt'],
    Label: ['id', 'name', 'color', 'createdAt', 'updatedAt'],
  };

  const {
    model = '', // Одна модель (Task, User, Project и т.д.)
    fields = [], // Поля, которые должны быть включены в отчет
    filters = {}, // Объект с фильтрами { поле: значение }
    groupBy, // Поле для группировки
    sortBy, // Поле для сортировки
    sortOrder = 'ASC', // Порядок сортировки
    chartType = 'bar', // Тип диаграммы
    startDate, // Начальная дата для временного интервала
    endDate // Конечная дата для временного интервала
  } = req.body;

  try {
    // Проверка модели
    // @ts-ignore
    if (!modelFields[model]) {
      return res.status(400).json({ error: 'Invalid model selected.' });
    }

    // Проверка полей
    for (const field of fields) {
      // @ts-ignore
      if (!modelFields[model].includes(field)) {
        return res.status(400).json({ error: `Invalid field '${field}' selected for model '${model}'.` });
      }
    }

    // Проверка поля группировки
    // @ts-ignore
    if (groupBy && !modelFields[model].includes(groupBy)) {
      return res.status(400).json({ error: `Invalid group by field '${groupBy}' selected for model '${model}'.` });
    }

    // Проверка поля сортировки
    // @ts-ignore
    if (sortBy && !modelFields[model].includes(sortBy)) {
      return res.status(400).json({ error: `Invalid sort by field '${sortBy}' selected for model '${model}'.` });
    }

    const entity = AppDataSource.getRepository(model);

    let query = entity.createQueryBuilder('entity');

    // Выбор полей
    if (fields.length > 0) {
      query = query.select(fields.map((field: any) => `entity.${field}`));
    }

    // Фильтры
    for (const [field, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        query = query.andWhere(`entity.${field} IN (:...values)`, { values: value });
      } else if (typeof value === 'string' && value.includes('%')) {
        query = query.andWhere(`entity.${field} LIKE :value`, { value });
      } else {
        query = query.andWhere(`entity.${field} = :value`, { value });
      }
    }

    // Временной интервал
    if (startDate && endDate) {
      query = query.andWhere(`entity.createdAt BETWEEN :start AND :end`, { start: startDate, end: endDate });
    }

    // Сортировка
    if (sortBy) {
      query = query.orderBy(`entity.${sortBy}`, sortOrder);
    }

    // Группировка
    let results;
    if (groupBy) {
      query = query.addSelect(`entity.${groupBy}`, 'groupByField')
        .addSelect('COUNT(*)', 'count')
        .groupBy(`entity.${groupBy}`);

      results = await query.getRawMany();
    } else {
      results = await query.getRawMany();
    }

    res.json({ chartType, reportData: results });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


export {
  generateReport,
  generatePriorityReport,
  generateOverdueReport,
  generateTeamPerformanceReport,
  generatePriorityDistributionReport,
  generateProgressReport,
  generateTeamWorkloadReport,
  generateUniversalReport
};
