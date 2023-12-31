import { Schema, Types, model } from 'mongoose';

import { sanitizedField } from '../../../utils/helpers';

import { DriveFileAttributes, DriveFolderAttributes } from './drive.types';

const driveFileSchema = new Schema<DriveFileAttributes>(
  {
    ParentFolder: Types.ObjectId,
    name: String,
    mimeType: String,
    extension: String,
    fullPath: String,
    size: Number,
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
      const path = `${parentFolder.fullPath}/${this.name}`;
      this.fullPath = sanitizedField(path);
    } else {
      this.fullPath = sanitizedField(`/${this.name}`);
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
      const path = `${parentFolder.fullPath}/${this.name}`;
      this.fullPath = sanitizedField(path);
    } else {
      this.fullPath = sanitizedField(`/${this.name}`);
    }
  }
  next();
});

driveFileSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('name')) {
    const fileExists = await DriveFileModel.findOne({
      name: this.name,
      ParentFolder: this.ParentFolder,
    });

    if (fileExists) {
      this.name = `${this.name}_${Math.random().toString(36).slice(2, 7)}`;
    }
  }

  next();
});

driveFolderSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('name')) {
    const folderExists = await DriveFolderModel.findOne({
      name: this.name,
      ParentFolder: this.ParentFolder,
    });

    if (folderExists) {
      this.name = `${this.name}_${Math.random().toString(36).slice(2, 7)}`;
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
