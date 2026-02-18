// Funções de cálculo para InvestorDashboard e outros módulos

// Projeta MRR para n meses com taxa de crescimento composta
export function forecastMRR(mrr: number, growthRate: number, months: number): number[] {
  const result: number[] = [];
  let current = mrr;
  for (let i = 0; i < months; i++) {
    current = current * (1 + growthRate);
    result.push(current);
  }
  return result;
}

// Margem real: (receita - custo) / receita * 100
export function calculateRealMargin(receita: number, custo: number): number {
  if (receita === 0) return 0;
  return ((receita - custo) / receita) * 100;
}

// LTV: lucro mensal * meses
export function calculateLTV(lucroMensal: number, meses: number): number {
  return lucroMensal * meses;
}

export function calculateMRR() { return 0; }
export function calculateChurnRate() { return 0; }
export function calculateARR() { return 0; }
