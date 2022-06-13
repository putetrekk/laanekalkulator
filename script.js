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

  const incrementYear = (year, savings, deposit, homeValue) => [
    year + 1,
    savings * depositInterest + deposit,
    deposit * depositAdjustment,
    homeValue * homeValueChange,
  ];

  let year = 0;

  const hist = [[year, initialSavings, initialDeposit, initialHomeValue]];

  while (year < 100) {
    hist.push(incrementYear(...hist[year]));
    year += 1;
  }

  generateTable(hist);
  //setOutputText(savings, deposit, homeValue, years);

  console.log(hist);
}

function generateTable(hist) {
  const table = document.getElementById("history-table");
  table.innerHTML = "";
  const header = table.createTHead();
  const headerRow = header.insertRow();
  [
    "År",
    "Sparte Midler",
    "Innskudd",
    "Boligverdi",
    "Egenandel",
    "Minimum Lønn (20% av lånesum)",
  ].map((x) => {
    cell = headerRow.insertCell();
    cell.innerHTML = x;
  });

  hist.map((x) => {
    table.appendChild(generateTableRow(...x));
  });
}

function generateTableRow(year, savings, deposit, homeValue) {
  const row = document.createElement("tr");

  const yearCell = document.createElement("td");
  yearCell.innerHTML = new Date().getFullYear() + year;
  row.appendChild(yearCell);

  const savingsCell = document.createElement("td");
  savingsCell.innerHTML = separateThousands(Math.round(savings));
  row.appendChild(savingsCell);

  const depositCell = document.createElement("td");
  depositCell.innerHTML = separateThousands(Math.round(deposit));
  row.appendChild(depositCell);

  const homeValueCell = document.createElement("td");
  homeValueCell.innerHTML = separateThousands(Math.round(homeValue));
  row.appendChild(homeValueCell);

  const ownShare = roundToDecimals((savings / homeValue) * 100, 1);
  const ownShareCell = document.createElement("td");
  ownShareCell.innerHTML = `${ownShare}%`;
  row.appendChild(ownShareCell);

  const minimumPay = separateThousands(Math.round((homeValue - savings) / 5));
  const minimumPayCell = document.createElement("td");
  minimumPayCell.innerHTML = minimumPay;
  row.appendChild(minimumPayCell);

  return row;
}

function setOutputText(savings, deposit, homeValue, years) {
  const currentYear = new Date().getFullYear();
  const goalYear = currentYear + years;

  const loanAmount = homeValue - savings;
  const minimumPay = Math.round(loanAmount / 5);

  egenandelText = document.getElementById("egenandel-krav-text");
  boligverdiText = document.getElementById("boligverdi-text");
  loennText = document.getElementById("loenn-text");

  egenandelText.innerHTML = `Du når 15% (krav om egenandel) om ${years} år. (${goalYear})`;
  boligverdiText.innerHTML = `Da er boligen verdt ${separateThousands(
    Math.round(homeValue)
  )}.`;
  loennText.innerHTML = `For å ikke låne mer enn fem ganger inntekten må du ha en lønn på ${separateThousands(
    minimumPay
  )}.`;
}

function separateThousands(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function roundToDecimals(number, decimals) {
  const fac = Math.pow(10, decimals);
  return Math.round(number * fac) / fac;
}
