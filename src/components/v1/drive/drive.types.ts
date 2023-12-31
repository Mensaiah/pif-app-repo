import { Document, Types } from 'mongoose';

export interface DriveFileAttributes extends Document {
  ParentFolder: Types.ObjectId;
  name: string;
  mimeType: string; // should change to supported mime types
  extension: string;
  fullPath: string;
  size: number; // in bytes
  source: string;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date;
  canBeAccessedBy: string[]; // e.g superAdmin, admin, customerAgent
}

export interface DriveFolderAttributes extends Document {
  ParentFolder: Types.ObjectId;
  name: string;
  fullPath: string;
  contentCounts: { files: number; folders: number };
  createdBy: string;
  updatedBy: string;
  deletedAt: Date;
  canbeAccessedBy: string[]; // e.g superAdmin, admin, customerAgent
}
