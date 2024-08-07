import { Request, Response } from 'express'
import { Task, Project } from '../models'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import axios from 'axios'

const importData = async (req: Request, res: Response) => {
  try {
    const file = req.file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    const data = JSON.parse(readFileSync(file.path, 'utf-8'))
    // Import logic here (e.g., create tasks and projects)
    await Task.bulkCreate(data.tasks)
    await Project.bulkCreate(data.projects)
    res.status(200).json({ message: 'Data imported successfully' })
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const exportData = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.findAll()
    const projects = await Project.findAll()
    const data = { tasks, projects }
    const filePath = join(__dirname, '../../exports/data.json')
    writeFileSync(filePath, JSON.stringify(data, null, 2))
    res.download(filePath)
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const importFromGitHub = async (req: Request, res: Response) => {
  const token = req.params.token || req.body.token
  const repoUrl = req.params.repoUrl || req.body.repoUrl
  const projectId = req.params.projectId || req.body.projectId
  try {
    // Extract the owner and repo name from the repoUrl
    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/')

    // Fetch project columns from GitHub
    const { data: columns } = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/projects`,
      {
        headers: { Authorization: `token ${token}` }
      }
    )

    // Iterate through each column and fetch tasks
    for (const column of columns) {
      const { data: tasks } = await axios.get(column.cards_url, {
        headers: { Authorization: `token ${token}` }
      })

      // Process each task
      for (const task of tasks) {
        // You can map the GitHub task fields to your Task model fields here
        await Task.create({
          title: task.note,
          description: task.note,
          status: column.name,
          projectId: 1, // This should be set to the appropriate project ID in your system
          assigneeIds: [], // This should be set to the appropriate user ID in your system
          labelId: null, // This should be set to the appropriate label ID in your system
          dueDate: null,
          priority: 'Medium'
        })
      }
    }

    res.status(200).json({ message: 'Data imported from GitHub successfully' })
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

export { importData, exportData, importFromGitHub }
