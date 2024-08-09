import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { Project } from '../models/Project';
import { startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import {Task} from "../models/Task";

type DateRange = [Date, Date];

const generateReport = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { startDate, user = 'all' } = req.query;

  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ['tasks', 'tasks.assignees'],
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = project.tasks.filter(task => new Date(task.updatedAt) >= new Date(startDate as string) &&
      (user === 'all' || task.assignees.some(assignee => assignee.id === parseInt(user as string))));

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
  const { period = 'all', user = 'all' } = req.query;

  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ['tasks', 'tasks.assignees'],
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const now: Date = new Date();
    let dateRange: DateRange;

    switch (period) {
      case 'week':
        dateRange = [startOfWeek(now), now];
        break;
      case 'month':
        dateRange = [startOfMonth(now), now];
        break;
      case 'year':
        dateRange = [startOfYear(now), now];
        break;
      default:
        dateRange = [new Date(0), now]; // Все время
    }

    const tasks = project.tasks.filter((task) => {
      const isInRange = task.createdAt >= dateRange[0] && task.createdAt <= dateRange[1];
      const isAssignedToUser = user === 'all' || task.assignees.some(assignee => assignee.id === parseInt(user as string));
      return isInRange && isAssignedToUser;
    });

    const reportData = tasks.reduce((acc: Record<string, number>, task: Task) => {
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
    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ['tasks'],
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = project.tasks.filter(task => new Date(task.dueDate) >= new Date(startDate as string) && new Date(task.dueDate) < new Date() && task.status !== 'Done');

    const overdueData = tasks.reduce((acc, task) => {
      const date = new Date(task.dueDate).toLocaleDateString();
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
  const { projectId } = req.params;
  const { startDate } = req.query;

  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ['tasks', 'tasks.assignees'],
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = project.tasks.filter(task => new Date(task.updatedAt) >= new Date(startDate as string));

    const performance = tasks.reduce(
      (acc, task) => {
        task.assignees.forEach((assignee) => {
          acc[assignee.id] = acc[assignee.id] || { total: 0, completed: 0 };
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
    res.status(400).json({ error: err.message });
  }
};


const generatePriorityDistributionReport = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { period = 'all', user = 'all', type = 'priority' } = req.query;

  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const project: Project | null = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ['tasks', 'tasks.assignees'],
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const now: Date = new Date();
    let dateRange: DateRange;

    switch (period) {
      case 'week':
        dateRange = [startOfWeek(now), now];
        break;
      case 'month':
        dateRange = [startOfMonth(now), now];
        break;
      case 'year':
        dateRange = [startOfYear(now), now];
        break;
      default:
        dateRange = [new Date(0), now]; // Все время
    }

    const tasks: Task[] | undefined = project.tasks?.filter((task: Task) => {
      const isInRange = task.createdAt >= dateRange[0] && task.createdAt <= dateRange[1];
      const isAssignedToUser = user === 'all' || task.assignees.some(assignee => assignee.id === parseInt(user.toString()));
      return isInRange && isAssignedToUser;
    });

    const reportData = tasks?.reduce(
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
    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ['tasks'],
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = project.tasks.filter(task => new Date(task.updatedAt) >= new Date(startDate as string));

    const progress = tasks.reduce(
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
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const generateTeamWorkloadReport = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { startDate } = req.query;

  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ['tasks', 'tasks.assignees'],
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = project.tasks.filter(task => new Date(task.createdAt) >= new Date(startDate as string));

    const workload = tasks.reduce(
      (acc, task) => {
        task.assignees.forEach((assignee) => {
          if (!acc[assignee.id]) {
            acc[assignee.id] = 0;
          }
          acc[assignee.id] += 1;
        });
        return acc;
      },
      {} as Record<string | number, number>
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
