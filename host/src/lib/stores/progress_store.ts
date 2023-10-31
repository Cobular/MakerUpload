interface ProgressObject {
  file_name: string;
  progress: number;
}

export type Progress = undefined | ProgressObject;