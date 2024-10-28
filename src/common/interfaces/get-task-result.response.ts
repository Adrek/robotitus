import { SolutionCaptcha } from './solution-captcha';

export interface GetTaskResultResponse {
  errorId: number;
  status: 'processing' | 'ready';
  solution: SolutionCaptcha | null;
  cost: string | null;
  ip: string | null;
  createTime: number | null;
  endTime: number | null;
  solveCount: number | null;
}
