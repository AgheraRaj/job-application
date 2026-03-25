import mongoose, { Document } from "mongoose";

export interface IBoard extends Document {
  name: string;
  userId: string;
  columns: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new mongoose.Schema<IBoard>(
  {
    name: {
      type: String,
      required: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    columns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Column",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const boardModel = mongoose.models.Board || mongoose.model<IBoard>("Board", boardSchema);

export default boardModel;
