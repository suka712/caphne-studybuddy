export interface StepNavState {
  canGoBack: boolean;
  canGoNext: boolean;
  isLoading: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export function useStepNav() {
  return useState<StepNavState | null>("step-nav", () => null);
}
