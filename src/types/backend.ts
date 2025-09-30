export interface BackendChartSuggestion {
  chart_type: 'line' | 'bar' | 'scatter' | 'area' | 'pie';
  columns: string[];
  reason?: string;
}

export interface BackendAnswerPayload {
  answer: string;
  chart_suggestions?: BackendChartSuggestion[];
  cot_prompt?: string;
  dataset_id?: string;
  question?: string;
  reasoning_sources?: any[];
  selected_columns?: any;
  success?: boolean;
}


