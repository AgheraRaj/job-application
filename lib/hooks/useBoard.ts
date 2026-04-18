"use client";

import { useEffect, useState } from "react";
import { Board, Column, JobApplication } from "../models/models.type";
import { updateJobApplication, deleteColumn as deleteColumnAction } from "../action/job-applications";

export function useBoard(initialBoard?: Board | null) {
  const [board, setBoard] = useState<Board | null>(initialBoard || null);
  const [columns, setColumns] = useState<Column[]>(initialBoard?.columns || []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBoard) {
        setBoard(initialBoard);
        setColumns(initialBoard.columns || []);
    }
  }, [initialBoard])

  async function moveJob(
    jobApplicationId: string,
    newColumnId: string,
    newOrder: number,
  ) {
    setColumns((prev) => {
      const newColumns = prev.map((col) => ({
        ...col,
        jobApplications: [...col.jobApplications],
      }));

      // Find and remove job from the old column

      let jobToMove: JobApplication | null = null;
      let oldColumnId: string | null = null;

      for (const col of newColumns) {
        const jobIndex = col.jobApplications.findIndex(
          (j) => j._id === jobApplicationId
        );
        if (jobIndex !== -1 && jobIndex !== undefined) {
          jobToMove = col.jobApplications[jobIndex];
          oldColumnId = col._id;
          col.jobApplications = col.jobApplications.filter(
            (job) => job._id !== jobApplicationId
          );
          break;
        }
      }

      if (jobToMove && oldColumnId) {
        const targetColumnIndex = newColumns.findIndex(
          (col) => col._id === newColumnId
        );
        if (targetColumnIndex !== -1) {
          const targetColumn = newColumns[targetColumnIndex];
          const currentJobs = targetColumn.jobApplications || [];

          const updatedJobs = [...currentJobs];
          updatedJobs.splice(newOrder, 0, {
            ...jobToMove,
            columnId: newColumnId,
            order: newOrder * 100,
          });

          const jobsWithUpdatedOrders = updatedJobs.map((job, idx) => ({
            ...job,
            order: idx * 100,
          }));

          newColumns[targetColumnIndex] = {
            ...targetColumn,
            jobApplications: jobsWithUpdatedOrders,
          };
        }
      }

      return newColumns;
    });

    try {
      const result = await updateJobApplication(jobApplicationId, {
        columnId: newColumnId,
        order: newOrder,
      });
    } catch (err) {
      console.error("Error", err);
    }
  }

  async function deleteColumn(columnId: string) {
    if (!board?._id) return;

    // Optimistic update: remove column from local state immediately
    setColumns((prev) => prev.filter((col) => col._id !== columnId));

    try {
      const result = await deleteColumnAction(columnId, board._id);
      if (result?.error) {
        // Revert on server error
        setColumns(board.columns || []);
        setError(result.error);
      }
    } catch (err) {
      console.error("Error deleting column", err);
      setColumns(board.columns || []);
    }
  }

  return { board, columns, error, moveJob, deleteColumn };
}