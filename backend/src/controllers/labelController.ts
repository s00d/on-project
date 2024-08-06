import { Request, Response } from 'express'
import { Label } from '../models'

const getLabels = async (req: Request, res: Response) => {
  const labels = await Label.findAll()
  res.json(labels)
}

const createLabel = async (req: Request, res: Response) => {
  const { name, color } = req.body
  try {
    const label = await Label.create({ name, color })
    res.json(label)
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const updateLabel = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, color } = req.body
  try {
    const label = await Label.findByPk(id)
    if (label) {
      await label.update({ name, color })
      res.json(label)
    } else {
      res.status(404).json({ error: 'Label not found' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const deleteLabel = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const label = await Label.findByPk(id)
    if (label) {
      await label.destroy()
      res.status(204).end()
    } else {
      res.status(404).json({ error: 'Label not found' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

export { getLabels, createLabel, updateLabel, deleteLabel }
