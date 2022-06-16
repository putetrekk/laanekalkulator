export class YearStats {
  constructor(settings, previousYear) {
    if (previousYear === undefined) {
      this.year = 0;
      this.savings = settings.initialSavings;
      this.deposit = settings.initialDeposit;
      this.homeValue = settings.initialHomeValue;
      this.settings = settings;
      return;
    }

    this.year = previousYear.year + 1;
    this.savings = previousYear.savings + previousYear.deposit;
    this.deposit = previousYear.deposit * settings.depositAdjustment;
    this.homeValue = previousYear.homeValue * settings.homeValueChange;
    this.settings = settings;
  }

  get absoluteYear() {
    return new Date().getFullYear() + this.year;
  }

  get costs() {
    return this.homeValue * this.settings.costsShare;
  }

  get collateralRequirement() {
    return this.homeValue * 0.15 + this.costs;
  }

  get ownShareAfterCosts() {
    return (this.savings - this.costs) / this.homeValue;
  }

  get loanAmount() {
    return this.homeValue - this.savings - this.costs;
  }

  get minimumEarnings() {
    const loanFactorLimit = 5;
    return this.loanAmount / loanFactorLimit;
  }
}

export class Settings {
  constructor(
    initialSavings,
    initialDeposit,
    depositAdjustment,
    depositInterest,
    initialHomeValue,
    homeValueChange,
    costsShare
  ) {
    this.initialSavings = initialSavings;
    this.initialDeposit = initialDeposit;
    this.depositAdjustment = depositAdjustment;
    this.depositInterest = depositInterest;
    this.initialHomeValue = initialHomeValue;
    this.homeValueChange = homeValueChange;
    this.costsShare = costsShare;
  }
}

export const getNextYear = (previousYear) =>
  new YearStats(previousYear.settings, previousYear);

export const formatMoney = (amount) => separateThousands(Math.round(amount));

export const formatPercent = (share, relative) => {
  const percentage = relative ? (share - 1) * 100 : share * 100;
  const prefix = percentage >= 0 ? "+" : "";
  const rounded = roundToDecimals(percentage, 2);
  return relative ? `${prefix}${rounded}%` : `${rounded}%`;
};

export function separateThousands(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function roundToDecimals(number, decimals) {
  const fac = Math.pow(10, decimals);
  return Math.round(number * fac) / fac;
}
