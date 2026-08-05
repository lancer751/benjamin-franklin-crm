import { describe, expect, it } from "vitest";
import { adaptLeadTasks } from "./leadDetailAdapter";
import { taskAuthorName, taskWasUpdated } from "../components/lead-detail/leadDetail.formatters";

describe("lead task adapter", () => {
  it("maps task metadata and normalizes the author name", () => {
    const [task] = adaptLeadTasks({
      data: {
        tasks: [{
          id: "task-1",
          title: "Llamar",
          content: "Llamar al cliente",
          is_done: false,
          due_date: null,
          created_at: "2026-08-05T16:00:00.000Z",
          updated_at: "2026-08-05T20:00:00.000Z",
          author: { first_name: " Ana ", last_name: "Romero  Romero " },
        }],
      },
    });

    expect(task).toEqual({
      id: "task-1",
      title: "Llamar",
      content: "Llamar al cliente",
      isDone: false,
      dueDate: null,
      author: { firstName: " Ana ", lastName: "Romero  Romero " },
      createdAt: "2026-08-05T16:00:00.000Z",
      updatedAt: "2026-08-05T20:00:00.000Z",
    });
    expect(taskAuthorName(task!)).toBe("Ana Romero Romero");
    expect(taskWasUpdated(task!)).toBe(true);
  });

  it("does not mark a task as updated for the same instant and handles a missing author", () => {
    const [task] = adaptLeadTasks({
      data: {
        tasks: [{
          id: "task-2",
          title: "Mandar brochure",
          content: "Mandar brochure comercial",
          is_done: true,
          created_at: "2026-08-05T16:00:00.000Z",
          updated_at: "2026-08-05T16:00:00.000Z",
          author: null,
        }],
      },
    });

    expect(task!.isDone).toBe(true);
    expect(taskAuthorName(task!)).toBe("Usuario no disponible");
    expect(taskWasUpdated(task!)).toBe(false);
  });
});
