import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { AppDataSource } from '../ormconfig';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

interface GitHubProject {
  id: number;
  name: string;
  columns_url: string;
}

interface GitHubColumn {
  id: number;
  name: string;
  cards_url: string;
}

interface GitHubCard {
  id: number;
  note: string | null;
}

const importData = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const data = JSON.parse(readFileSync(file.path, 'utf-8'));

    const taskRepository = AppDataSource.getRepository(Task);
    const projectRepository = AppDataSource.getRepository(Project);

    // Import logic here (e.g., create tasks and projects)
    await taskRepository.save(data.tasks);
    await projectRepository.save(data.projects);

    res.status(200).json({ message: 'Data imported successfully' });
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const exportData = async (req: Request, res: Response) => {
  try {
    const taskRepository = AppDataSource.getRepository(Task);
    const projectRepository = AppDataSource.getRepository(Project);

    const tasks = await taskRepository.find();
    const projects = await projectRepository.find();
    const data = { tasks, projects };
    const filePath = join(__dirname, '../../exports/data.json');
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.download(filePath);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const importFromGitHub = async (req: Request, res: Response) => {
  const token = req.params.token || req.body.token;
  const repoUrl = req.params.repoUrl || req.body.repoUrl;
  const projectId = req.params.projectId || req.body.projectId;
  try {
    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');

    const { data: projects } = await axios.get<GitHubProject[]>(
      `https://api.github.com/repos/${owner}/${repo}/projects`,
      {
        headers: { Authorization: `token ${token}` },
      }
    );

    const taskRepository = AppDataSource.getRepository(Task);
    const projectRepository = AppDataSource.getRepository(Project);

    const project = await projectRepository.findOne({ where: { id: parseInt(projectId) } });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    for (const githubProject of projects) {
      const { data: columns } = await axios.get<GitHubColumn[]>(
        githubProject.columns_url,
        {
          headers: { Authorization: `token ${token}` },
        }
      );

      for (const column of columns) {
        const { data: cards } = await axios.get<GitHubCard[]>(
          column.cards_url,
          {
            headers: { Authorization: `token ${token}` },
          }
        );

        for (const card of cards) {
          if (!card.note) {
            continue; // Skip cards without a note
          }

          const task = taskRepository.create({
            title: card.note as string,
            description: card.note,
            status: column.name,
            project: project,
            assignees: [],
            priority: 'Medium',
          });

          await taskRepository.save(task);
        }
      }
    }

    res.status(200).json({ message: 'Data imported from GitHub successfully' });
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

export { importData, exportData, importFromGitHub };
