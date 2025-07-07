await client.query(
  `INSERT INTO tasks (project_id, name, status, start_date, due_date, notes, plan_detail, goal_completion_date, type)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
   RETURNING *`,
  [
    project.id,
    task.name,
    task.status,
    task.startDate,
    task.dueDate,
    task.notes,
    task.planDetail,
    task.type || "current",
  ]
);

const formattedReport = {
  id: report.id,
  weekStart: report.week_start,
  weekEnd: report.week_end,
  projects: report.projects.map((project: any) => ({
    id: project.id,
    name: project.name,
    progress: project.progress,
    status: project.status,
    tasks: project.tasks.map((task: any) => ({
      id: task.id,
      name: task.name,
      status: task.status,
      startDate: task.start_date || "",
      dueDate: task.due_date || "",
      notes: task.notes || "",
      planDetail: task.plan_detail || "",
      type: task.type || "current",
    })),
  })),
  createdAt: report.created_at,
  updatedAt: report.updated_at,
};
