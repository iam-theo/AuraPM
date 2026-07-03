import { Router } from "express";
import projectRouter from "../modules/projects/interface/project.router.ts";
import taskRouter from "../modules/tasks/interface/task.router.ts";
import riskIssueRouter from "../modules/issues-risks/interface/risk-issue.router.ts";

const v1Router = Router();

v1Router.use("/projects", projectRouter);
v1Router.use("/tasks", taskRouter);
v1Router.use("/risks-issues", riskIssueRouter);

export default v1Router;
