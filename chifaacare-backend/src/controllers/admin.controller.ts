import { Request, Response } from 'express';

// TEMPORARY SAFE STUBS
// This file was empty which caused undefined route handlers. These stubs
// restore server boot. Replace with the real Prisma implementations when ready.

export const getOverview = async (req: Request, res: Response) => {
  res.json({ status: 'success', data: { stats: { patients: 0, doctors: 0, clinics: 0, appointments: 0 }, alerts: {} } });
};

export const listUsers = async (req: Request, res: Response) => {
  res.json({ status: 'success', data: { items: [], total: 0 } });
};

export const createUser = async (req: Request, res: Response) => {
  res.status(501).json({ status: 'error', message: 'createUser not yet implemented' });
};

export const listDoctors = async (req: Request, res: Response) => {
  res.json({ status: 'success', data: { items: [], total: 0 } });
};

export const approveDoctor = async (req: Request, res: Response) => {
  res.json({ status: 'success', data: { id: req.params.id, approved: true } });
};

export const listClinics = async (req: Request, res: Response) => {
  res.json({ status: 'success', data: { items: [], total: 0 } });
};

export const createClinic = async (req: Request, res: Response) => {
  res.status(501).json({ status: 'error', message: 'createClinic not yet implemented' });
};

export const updateClinic = async (req: Request, res: Response) => {
  res.json({ status: 'success', data: { id: req.params.id, ...req.body } });
};

export const listPatients = async (req: Request, res: Response) => {
  res.json({ status: 'success', data: { items: [], total: 0 } });
};

export const getLogs = async (req: Request, res: Response) => {
  res.json({ status: 'success', data: { items: [], total: 0 } });
};

export const getSettings = async (req: Request, res: Response) => {
  res.json({ status: 'success', data: [] });
};

export const updateSettings = async (req: Request, res: Response) => {
  res.json({ status: 'success', data: req.body || {} });
};

