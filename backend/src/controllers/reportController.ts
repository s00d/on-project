import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { Project } from '../models/Project';

const generateReport = async (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ['tasks'],
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const tasks = project.tasks;
    const completedTasks = tasks?.filter((task) => task.status === 'Done').length;
    const totalTasks = tasks?.length;
    const report = {
      project: project.name,
      description: project.description,
      completedTasks,
      totalTasks,
    };
    res.json(report);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const generatePriorityReport = async (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ['tasks'],
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const tasks = project.tasks;
    const priorityCounts = tasks?.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    res.json(priorityCounts);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const generateOverdueReport = async (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ['tasks'],
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const tasks = project.tasks;
    const overdueTasks = tasks?.filter(
      (task) => new Date(task.dueDate) < new Date() && task.status !== 'Done'
    ).length;
    res.json({ overdueTasks });
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const generateTeamPerformanceReport = async (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ['tasks', 'tasks.assignees'],
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const tasks = project.tasks;

    const performance = tasks?.reduce(
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
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const generatePriorityDistributionReport = async (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ['tasks'],
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const tasks = project.tasks;
    const priorityCounts = tasks?.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    res.json(priorityCounts);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const generateProgressReport = async (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ['tasks'],
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const tasks = project.tasks;
    const progress = tasks?.reduce(
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
  const projectId = req.params.projectId;
  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId) },
      relations: ['tasks', 'tasks.assignees'],
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const tasks = project.tasks;
    const workload = tasks?.reduce(
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
    const error = err as Error;
    res.status(400).json({ error: error.message });
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
};
