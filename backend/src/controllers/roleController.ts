import { Request, Response } from 'express';
import { Role } from '../models';
import { Permission } from '../models';
import { UserRole } from '../models';
import { io } from '../index';

const getRoles = async (req: Request, res: Response) => {
  const roles = await Role.findAll();
  res.json(roles);
};

const createRole = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const role = await Role.create({ name });
    io.emit('role:create', role);
    res.json(role);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const assignRole = async (req: Request, res: Response) => {
  const { userId, roleId, projectId } = req.body;
  try {
    const userRole = await UserRole.create({ userId, roleId, projectId });
    io.emit('userRole:create', userRole);
    res.json(userRole);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const getPermissions = async (req: Request, res: Response) => {
  const { roleId } = req.params;
  const permissions = await Permission.findAll({ where: { roleId } });
  res.json(permissions);
};

const createPermission = async (req: Request, res: Response) => {
  const { roleId, entity, action } = req.body;
  try {
    const permission = await Permission.create({ roleId, entity, action });
    io.emit('permission:create', permission);
    res.json(permission);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

export { getRoles, createRole, assignRole, getPermissions, createPermission };
