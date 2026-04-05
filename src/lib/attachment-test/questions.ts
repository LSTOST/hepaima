export type AttachmentAnswerKey =
  | "A1"
  | "A2"
  | "A3"
  | "A4"
  | "A5"
  | "A6"
  | "B1"
  | "B2"
  | "B3"
  | "B4"
  | "B5"
  | "B6";

export interface AttachmentQuestionItem {
  key: AttachmentAnswerKey;
  text: string;
}

/** 题目顺序与提交体 answers 键名一致 */
export const ATTACHMENT_QUESTIONS: AttachmentQuestionItem[] = [
  { key: "A1", text: "我很担心自己会被另一半抛弃" },
  { key: "A2", text: "我需要对方经常表达对我的感情，才能感到安心" },
  { key: "A3", text: "如果对方没有及时回消息，我会开始胡思乱想" },
  { key: "A4", text: "当对方显得疏远时，我会变得焦虑或愤怒" },
  { key: "A5", text: "我比大多数人更担心感情不够稳固" },
  { key: "A6", text: "我总是觉得自己对感情投入得比对方多" },
  { key: "B1", text: "我不太舒适于向伴侣倾诉内心深处的想法和感受" },
  { key: "B2", text: "在关系中过于亲密会让我感到不自在" },
  { key: "B3", text: "我倾向于不依赖任何人，靠自己解决问题" },
  { key: "B4", text: "需要别人会让我感到有点不舒服" },
  { key: "B5", text: "当伴侣想要在情感上更亲近时，我会有些退缩" },
  { key: "B6", text: "我在感情中不太擅长表达脆弱和需求" },
];

export const ATTACHMENT_ANSWER_KEYS: AttachmentAnswerKey[] = ATTACHMENT_QUESTIONS.map(
  (q) => q.key
);
