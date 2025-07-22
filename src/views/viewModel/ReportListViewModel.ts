"use client";

import { useState, useEffect } from "react";
import { ReportDomain } from "../../core/domain/ReportDomain";
import { Report, GetReportsRequestType } from "../../core/entity/ReportTypes";

export interface ReportListState {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
}

export class ReportListViewModel {
  private _state: ReportListState = {
    reports: [],
    isLoading: false,
    error: null,
  };

  private _setState: React.Dispatch<React.SetStateAction<ReportListState>> | null = null;

  constructor(private reportDomain: ReportDomain) {}

  get state(): ReportListState {
    return this._state;
  }

  init(setState: React.Dispatch<React.SetStateAction<ReportListState>>): void {
    this._setState = setState;
  }

  private updateState(newState: Partial<ReportListState>): void {
    this._state = { ...this._state, ...newState };
    this._setState?.(this._state);
  }

  async loadReports(request: GetReportsRequestType = {}): Promise<void> {
    if (this._state.isLoading) return;

    this.updateState({ isLoading: true, error: null });

    try {
      const response = await this.reportDomain.getReports(request);

      if (response.success && response.data) {
        this.updateState({
          isLoading: false,
          reports: response.data,
          error: null
        });
      } else {
        this.updateState({
          isLoading: false,
          error: response.message || "보고서를 불러오는 중 오류가 발생했습니다."
        });
      }
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: "네트워크 오류가 발생했습니다."
      });
    }
  }

  async loadPersonalReports(request: GetReportsRequestType = {}): Promise<void> {
    if (this._state.isLoading) return;

    this.updateState({ isLoading: true, error: null });

    try {
      const response = await this.reportDomain.getPersonalReports(request);

      if (response.success && response.data) {
        this.updateState({
          isLoading: false,
          reports: response.data,
          error: null
        });
      } else {
        this.updateState({
          isLoading: false,
          error: response.message || "개인 보고서를 불러오는 중 오류가 발생했습니다."
        });
      }
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: "네트워크 오류가 발생했습니다."
      });
    }
  }
}

export function useReportListViewModel(reportDomain: ReportDomain) {
  const [viewModel] = useState(() => new ReportListViewModel(reportDomain));
  const [state, setState] = useState<ReportListState>(viewModel.state);

  if (!viewModel["_setState"]) {
    viewModel.init(setState);
  }

  return { viewModel, state };
}

// 기존 usePersonalReports 대체
export function usePersonalReports(reportDomain: ReportDomain) {
  const { viewModel, state } = useReportListViewModel(reportDomain);

  useEffect(() => {
    viewModel.loadPersonalReports();
  }, [viewModel]);

  return {
    reports: state.reports,
    loading: state.isLoading,
    error: state.error,
    refresh: () => viewModel.loadPersonalReports()
  };
}