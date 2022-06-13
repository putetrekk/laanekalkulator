document
  .getElementById("calculate-button")
  .addEventListener("click", calculate_loan);

const startkapitalSlider = document.getElementById("startkapital-slider");
const startkapitalDisplay = document.getElementById("startkapital-display");
startkapitalSlider.addEventListener("input", () => {
  startkapitalDisplay.innerHTML = separateThousands(startkapitalSlider.value);
});

const innskuddSlider = document.getElementById("innskudd-slider");
const innskuddDisplay = document.getElementById("innskudd-display");
innskuddSlider.addEventListener("input", () => {
  innskuddDisplay.innerHTML = separateThousands(innskuddSlider.value);
});

const innskuddEndringSlider = document.getElementById(
  "innskudd-endring-slider"
);
const innskuddEndringDisplay = document.getElementById(
  "innskudd-endring-display"
);
innskuddEndringSlider.addEventListener("input", () => {
  endring = innskuddEndringSlider.value;
  innskuddEndringDisplay.innerHTML = `${endring} (${roundToDecimals(
    (endring - 1) * 100,
    1
  )}%)`;
});

const innskuddRenteSlider = document.getElementById("innskudd-rente-slider");
const innskuddRenteDisplay = document.getElementById("innskudd-rente-display");
innskuddRenteSlider.addEventListener("input", () => {
  endring = innskuddRenteSlider.value;
  innskuddRenteDisplay.innerHTML = `${endring} (${roundToDecimals(
    (endring - 1) * 100,
    1
  )}%)`;
});

const boligprisSlider = document.getElementById("boligpris-slider");
const boligprisDisplay = document.getElementById("boligpris-display");
boligprisSlider.addEventListener("input", () => {
  boligprisDisplay.innerHTML = separateThousands(boligprisSlider.value);
});

const boligEndringSlider = document.getElementById("bolig-endring-slider");
const boligEndringDisplay = document.getElementById("bolig-endring-display");
boligEndringSlider.addEventListener("input", () => {
  endring = boligEndringSlider.value;
  boligEndringDisplay.innerHTML = `${endring} (${roundToDecimals(
    (endring - 1) * 100,
    1
  )}%)`;
});

console.log("script initialisation complete");

function calculate_loan() {
  const initialSavings = startkapitalSlider.value;
  const initialDeposit = innskuddSlider.value * 12;
  const depositAdjustment = innskuddEndringSlider.value;
  const depositInterest = innskuddRenteSlider.value;
  const initialHomeValue = boligprisSlider.value;
  const homeValueChange = boligEndringSlider.value;

  const incrementYear = (savings, deposit, homeValue, years) => [
    savings * depositInterest + deposit,
    deposit * depositAdjustment,
    homeValue * homeValueChange,
    years + 1,
  ];

  let savings = initialSavings;
  let deposit = initialDeposit;
  let homeValue = initialHomeValue;
  let years = 0;

  while (years < 1000) {
    if (savings >= homeValue * 0.15) break;

    [savings, deposit, homeValue, years] = incrementYear(
      savings,
      deposit,
      homeValue,
      years
    );
  }

  setOutputText(savings, deposit, homeValue, years);

  console.log(savings);
  console.log(deposit);
  console.log(homeValue);
  console.log(years);
}

function setOutputText(savings, deposit, homeValue, years) {
    const currentYear = (new Date()).getFullYear();
    const goalYear = currentYear + years;

    const loanAmount = homeValue - savings;
    const minimumPay = Math.round(loanAmount / 5);

    egenandelText = document.getElementById("egenandel-krav-text");
    boligverdiText = document.getElementById("boligverdi-text");
    loennText = document.getElementById("loenn-text");

    egenandelText.innerHTML = `Du når 15% (krav om egenandel) om ${years} år. (${goalYear})`
    boligverdiText.innerHTML = `Da er boligen verdt ${separateThousands(Math.round(homeValue))}.`
    loennText.innerHTML = `For å ikke låne mer enn fem ganger inntekten må du ha en lønn på ${separateThousands(minimumPay)}.`
}

function separateThousands(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function roundToDecimals(number, decimals) {
  const fac = Math.pow(10, decimals);
  return Math.round(number * fac) / fac;
}
