export interface UniqueJob {

    title: string;
    current_band: string;
    current_grade: string;
    curret_grade_color: string;
    hayScore: number;
    outlierIcon: -1 | 1 | 0;
    stepGapIcon: "High Step Gap" | "Low Step Gap" | "Other Step Gap";
    id: string;
    parentId: string;
    sub_job_family: string;
  }

  export interface Data {
    band: string;
    range: string;
    percentage: string;
    uniqueJobs: UniqueJob[];

  }