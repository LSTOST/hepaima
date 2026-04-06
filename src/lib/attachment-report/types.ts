export type AttachmentTypeCode =
  | "SECURE"
  | "ANXIOUS"
  | "AVOIDANT"
  | "FEARFUL"
  | string;

export type ReportSections = {
  overview: string;
  patterns: string;
  conflicts: string;
  compatibility: string;
  exercises: string;
};

export type AttachmentReportData = {
  type_code: AttachmentTypeCode;
  type_name: string;
  anxiety_score: number;
  avoidance_score: number;
  nickname: string;
  sections: ReportSections;
};
