"use client";

import { useState } from "react";
import { ReportDomain } from "../../core/domain/ReportDomain";
import { Project, IssueRisk, CreateReportRequestType } from "../../core/entity/ReportTypes";

export interface CreateReportState {
  weekStart: string;
  weekEnd: string;
  projects: Project[];
  issuesRisks: IssueRisk[];
  isLoading: boolean;
  error: string | null;
  isCreated: boolean;
}

export class CreateReportViewModel {
  private _state: CreateReportState = {
    weekStart: "",
    weekEnd: "",
    projects: [],
    issuesRisks: [],
    isLoading: false,
    error: null,
    isCreated: false,
  };

  private _setState: React.Dispatch<React.SetStateAction<CreateReportState>> | null = null;

  constructor(private reportDomain: ReportDomain) {}

  get state(): CreateReportState {
    return this._state;
  }

  init(setState: React.Dispatch<React.SetStateAction<CreateReportState>>): void {
    this._setState = setState;
  }

  private updateState(newState: Partial<CreateReportState>): void {
    this._state = { ...this._state, ...newState };
    this._setState?.(this._state);
  }

  updateWeekStart(weekStart: string): void {
    this.updateState({ weekStart, error: null });
  }

  updateWeekEnd(weekEnd: string): void {
    this.updateState({ weekEnd, error: null });
  }

  addProject(project: Project): void {
    this.updateState({ 
      projects: [...this._state.projects, project],
      error: null 
    });
  }

  updateProject(index: number, project: Project): void {
    const projects = [...this._state.projects];
    projects[index] = project;
    this.updateState({ projects, error: null });
  }

  removeProject(index: number): void {
    const projects = this._state.projects.filter((_, i) => i !== index);
    this.updateState({ projects, error: null });
  }

  addIssueRisk(issueRisk: IssueRisk): void {
    this.updateState({ 
      issuesRisks: [...this._state.issuesRisks, issueRisk],
      error: null 
    });
  }

  updateIssueRisk(index: number, issueRisk: IssueRisk): void {
    const issuesRisks = [...this._state.issuesRisks];
    issuesRisks[index] = issueRisk;
    this.updateState({ issuesRisks, error: null });
  }

  removeIssueRisk(index: number): void {
    const issuesRisks = this._state.issuesRisks.filter((_, i) => i !== index);
    this.updateState({ issuesRisks, error: null });
  }

  async createReport(): Promise<void> {
    if (this._state.isLoading) return;

    this.updateState({ isLoading: true, error: null });

    const request: CreateReportRequestType = {
      weekStart: this._state.weekStart,
      weekEnd: this._state.weekEnd,
      projects: this._state.projects,
      issuesRisks: this._state.issuesRisks,
    };

    try {
      const response = await this.reportDomain.createReport(request);

      if (response.success) {
        this.updateState({
          isLoading: false,
          isCreated: true,
          error: null
        });
      } else {
        this.updateState({
          isLoading: false,
          error: response.message || "보고서 생성에 실패했습니다."
        });
      }
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: "네트워크 오류가 발생했습니다."
      });
    }
  }

  resetForm(): void {
    this.updateState({
      weekStart: "",
      weekEnd: "",
      projects: [],
      issuesRisks: [],
      isLoading: false,
      error: null,
      isCreated: false,
    });
  }
}

export function useCreateReportViewModel(reportDomain: ReportDomain) {
  const [viewModel] = useState(() => new CreateReportViewModel(reportDomain));
  const [state, setState] = useState<CreateReportState>(viewModel.state);

  if (!viewModel["_setState"]) {
    viewModel.init(setState);
  }

  return { viewModel, state };
}