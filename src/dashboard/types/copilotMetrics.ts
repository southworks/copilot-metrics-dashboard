export interface CopilotMetrics {
  id: string;
  date: string;
  total_active_users: number;
  total_engaged_users: number;
  copilot_ide_code_completions: CodeCompletions;
  copilot_ide_chat: IDEChat;
}

export interface CodeCompletions {
  total_engaged_users: number;
  languages: LanguageBreakdown[];
  editors: EditorBreakdown[];
}

export interface LanguageBreakdown {
  name: string;
  total_engaged_users: number;
}

export interface EditorBreakdown {
  name: string;
  total_engaged_users: number;
  models: ModelBreakdown[];
}

export interface ModelBreakdown {
  name: string;
  is_custom_model: boolean;
  custom_model_training_date: string | null;
  total_engaged_users: number;
  languages: LanguageDetail[];
}

export interface LanguageDetail {
  name: string;
  total_engaged_users: number;
  total_code_suggestions: number;
  total_code_acceptances: number;
  total_code_lines_suggested: number;
  total_code_lines_accepted: number;
}

export interface IDEChat {
  total_engaged_users: number;
  editors: IDEChatEditor[];
}

export interface IDEChatEditor {
  name: string;
  total_engaged_users: number;
  models: IDEChatModel[];
}

export interface IDEChatModel {
  name: string;
  is_custom_model: boolean;
  custom_model_training_date: string | null;
  total_engaged_users: number;
  total_chats: number;
  total_chat_insertion_events: number;
  total_chat_copy_events: number;
}

export interface CopilotMetricsOutput extends CopilotMetrics {
  time_frame_week: string;
  time_frame_month: string;
  time_frame_display: string;
}