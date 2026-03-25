import mongoose, { Document } from "mongoose";

export interface IColumn extends Document {
  name: string;
  boardId: mongoose.Types.ObjectId;
  order: number;
  jobApplications: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const columnSchema = new mongoose.Schema<IColumn>(
  {
    name: {
      type: String,
      required: true,
    },

    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Board",
      index: true,
    },

    order: {
      type: Number,
      required: true,
      default: 0,
    },

    jobApplications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobApplication",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const columnModel = mongoose.models.Column || mongoose.model<IColumn>("Column", columnSchema);

export default columnModel;
