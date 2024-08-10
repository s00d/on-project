import { Request, Response } from 'express'
import { AppDataSource } from '../ormconfig'
import { Roadmap } from '../models/Roadmap'
import { io } from '../index'
import { Project } from '../models/Project'

const getRoadmaps = async (req: Request, res: Response) => {
  const { projectId } = req.params
  try {
    const userId = req.session.user!.id

    const roadmapRepository = AppDataSource.getRepository(Roadmap)
    const projectRepository = AppDataSource.getRepository(Project)

    const project = await projectRepository
      .createQueryBuilder('project')
      .innerJoin('project.projectUsers', 'projectUser', 'projectUser.userId = :userId', { userId })
      .where('project.id = :projectId', { projectId })
      .getOne()

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    const roadmaps = await roadmapRepository.find({
      where: { project: { id: parseInt(projectId) } }
    })

    res.json(roadmaps)
  } catch (err: any) {
    const error = err as Error
    console.log(222, error)
    res.status(400).json({ error: error.message })
  }
}

const createRoadmap = async (req: Request, res: Response) => {
  const { projectId } = req.params

  const { title, description } = req.body
  try {
    const roadmapRepository = AppDataSource.getRepository(Roadmap)
    const projectRepository = AppDataSource.getRepository(Project)

    const project = await projectRepository.findOne({ where: { id: parseInt(projectId) } })

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const roadmap = roadmapRepository.create({ title, description, project })
    await roadmapRepository.save(roadmap)
    io.emit('roadmap:create', roadmap)
    res.json(roadmap)
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const updateRoadmap = async (req: Request, res: Response) => {
  const { id } = req.params
  const { title, description } = req.body
  try {
    const roadmapRepository = AppDataSource.getRepository(Roadmap)
    const roadmap = await roadmapRepository.findOne({ where: { id: parseInt(id) } })
    if (roadmap) {
      roadmap.title = title
      roadmap.description = description
      await roadmapRepository.save(roadmap)
      io.emit('roadmap:update', roadmap)
      res.json(roadmap)
    } else {
      res.status(404).json({ error: 'Roadmap not found' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const deleteRoadmap = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const roadmapRepository = AppDataSource.getRepository(Roadmap)
    const roadmap = await roadmapRepository.findOne({ where: { id: parseInt(id) } })
    if (roadmap) {
      await roadmapRepository.remove(roadmap)
      io.emit('roadmap:delete', { id: Number(id) })
      res.status(204).end()
    } else {
      res.status(404).json({ error: 'Roadmap not found' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

export { getRoadmaps, createRoadmap, updateRoadmap, deleteRoadmap }
