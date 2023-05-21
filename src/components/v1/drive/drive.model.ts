import { Schema, Types, model } from 'mongoose';

import { DriveFileAttributes, DriveFolderAttributes } from './drive.types';

const driveFileSchema = new Schema<DriveFileAttributes>(
  {
    ParentFolder: Types.ObjectId,
    name: String,
    mimeType: String,
    extension: String,
    fullPath: String,
    size: String,
    source: String,
    createdBy: Types.ObjectId,
    updatedBy: Types.ObjectId,
    deletedAt: Date,
    canBeAccessedBy: [String],
  },
  { timestamps: true }
);

const driveFolderSchema = new Schema<DriveFolderAttributes>(
  {
    ParentFolder: Types.ObjectId,
    name: String,
    fullPath: String,
    contentCounts: { files: Number, folders: Number },
    createdBy: String,
    updatedBy: String,
    deletedAt: Date,
    canbeAccessedBy: [String], // e.g superAdmin, admin, customerAgent
  },
  { timestamps: true }
);

driveFolderSchema.pre('save', async function (next) {
  if (
    this.isNew ||
    this.isModified('name') ||
    this.isModified('ParentFolder')
  ) {
    if (this.ParentFolder) {
      const parentFolder = await DriveFolderModel.findById(this.ParentFolder);
      this.fullPath = `${parentFolder.fullPath}/${this.name}`;
    } else {
      this.fullPath = `/${this.name}`;
    }
  }
  next();
});

driveFileSchema.pre('save', async function (next) {
  if (
    this.isNew ||
    this.isModified('name') ||
    this.isModified('ParentFolder')
  ) {
    if (this.ParentFolder) {
      const parentFolder = await DriveFolderModel.findById(this.ParentFolder);
      this.fullPath = `${parentFolder.fullPath}/${this.name}`;
    } else {
      this.fullPath = `/${this.name}`;
    }
  }
  next();
});

export const DriveFileModel = model<DriveFileAttributes>(
  'DriveFile',
  driveFileSchema
);
export const DriveFolderModel = model<DriveFolderAttributes>(
  'DriveFolder',
  driveFolderSchema
);
