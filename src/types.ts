export interface PerspectiveData {
  theologians: string[];
  interpretation: string;
  keyFocus: string;
  historicalEvolution: string;
}

export interface Perspectives {
  catolica: PerspectiveData;
  reforma: PerspectiveData;
  calvinista: PerspectiveData;
  ortodoxa: PerspectiveData;
  judaica: PerspectiveData;
}

export interface AnalysisResult {
  reference: string;
  literalText: string;
  historicalContext: string;
  perspectives: Perspectives;
  convergence: string;
  divergence: string;
  secularHistorianView: string;
}

export interface SearchHistoryItem {
  query: string;
  reference: string;
  timestamp: string;
}
