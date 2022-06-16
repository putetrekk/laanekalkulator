import {
  Settings,
  YearStats,
  getNextYear,
  formatMoney,
  formatPercent,
} from "./utils.js";

const sliders = document.getElementsByClassName("slider");

Array.prototype.forEach.call(sliders, (element) =>
  element.addEventListener("change", calculate_loan)
);

const startkapitalSlider = document.getElementById("startkapital-slider");
const startkapitalDisplay = document.getElementById("startkapital-display");
startkapitalSlider.addEventListener("input", () => {
  startkapitalDisplay.innerHTML = formatMoney(startkapitalSlider.value);
});

const innskuddSlider = document.getElementById("innskudd-slider");
const innskuddDisplay = document.getElementById("innskudd-display");
innskuddSlider.addEventListener("input", () => {
  innskuddDisplay.innerHTML = formatMoney(innskuddSlider.value);
});

const innskuddEndringSlider = document.getElementById(
  "innskudd-endring-slider"
);
const innskuddEndringDisplay = document.getElementById(
  "innskudd-endring-display"
);
innskuddEndringSlider.addEventListener("input", () => {
  const endring = innskuddEndringSlider.value;
  innskuddEndringDisplay.innerHTML = `${endring} (${formatPercent(
    endring,
    true
  )})`;
});

const innskuddRenteSlider = document.getElementById("innskudd-rente-slider");
const innskuddRenteDisplay = document.getElementById("innskudd-rente-display");
innskuddRenteSlider.addEventListener("input", () => {
  const endring = innskuddRenteSlider.value;
  innskuddRenteDisplay.innerHTML = `${endring} (${formatPercent(
    endring,
    true
  )})`;
});

const boligprisSlider = document.getElementById("boligpris-slider");
const boligprisDisplay = document.getElementById("boligpris-display");
boligprisSlider.addEventListener("input", () => {
  boligprisDisplay.innerHTML = formatMoney(boligprisSlider.value);
});

const boligEndringSlider = document.getElementById("bolig-endring-slider");
const boligEndringDisplay = document.getElementById("bolig-endring-display");
boligEndringSlider.addEventListener("input", () => {
  const endring = boligEndringSlider.value;
  boligEndringDisplay.innerHTML = `${endring} (${formatPercent(
    endring,
    true
  )})`;
});

const omkostningerAndelSlider = document.getElementById(
  "omkostninger-andel-slider"
);
const omkostningerAndelDisplay = document.getElementById(
  "omkostninger-andel-display"
);
omkostningerAndelSlider.addEventListener("input", () => {
  const omkostninger = omkostningerAndelSlider.value;
  omkostningerAndelDisplay.innerHTML = `${omkostninger} (${formatPercent(
    omkostninger,
    false
  )})`;
});

console.log("script initialisation complete");

function getSettings() {
  const initialSavings = parseInt(startkapitalSlider.value);
  const initialDeposit = innskuddSlider.value * 12;
  const depositAdjustment = innskuddEndringSlider.value;
  const depositInterest = innskuddRenteSlider.value;
  const initialHomeValue = parseInt(boligprisSlider.value);
  const homeValueChange = boligEndringSlider.value;
  const costsShare = omkostningerAndelSlider.value;

  return new Settings(
    initialSavings,
    initialDeposit,
    depositAdjustment,
    depositInterest,
    initialHomeValue,
    homeValueChange,
    costsShare
  );
}

function calculate_loan() {
  const settings = getSettings();

  let year = 0;

  const hist = [new YearStats(settings, undefined)];

  while (year < 100) {
    hist.push(getNextYear(hist[year]));
    year += 1;
  }

  makeChart(hist);
  generateTable(hist);

  const whenMetOwnShare = hist.find((year) => year.ownShareAfterCosts >= 0.15);
  if (whenMetOwnShare) {
    setOutputText(whenMetOwnShare);
  } else {
    setDefaultOutputText();
  }
}

function makeChart(history) {
  const firstYear = history[0].absoluteYear;
  const yearsToPlot = 21;
  const hist = history.slice(0, yearsToPlot);
  Highcharts.chart("container", {
    title: {
      text: "Sparing vs Boligpris",
    },
    yAxis: {
      title: {
        text: "Norske Kroner",
      },
    },
    xAxis: {
      accessibility: {
        rangeDescription: `Range: ${firstYear} to ${firstYear + yearsToPlot}`,
      },
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
        pointStart: history[0].absoluteYear,
      },
    },
    series: [
      {
        name: "Boligpris",
        data: hist.map((year) => year.homeValue),
      },
      {
        name: "Krav egenandel",
        data: hist.map((year) => year.collateralRequirement),
      },
      {
        name: "Oppspart",
        data: hist.map((year) => year.savings),
      },
    ],
    chart: {
      height: "50%",
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
            },
          },
        },
      ],
    },
  });
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
    "Omkostninger",
    "Total Pris",
    "Egenandel<br>(Etter omkostninger)",
    "Lønn<br>(<sup>Lånesum</sup>&frasl;<sub>5</sub>)",
  ].map((x) => {
    const cell = headerRow.insertCell();
    cell.innerHTML = x;
  });

  hist.map((year) => {
    table.appendChild(generateTableRow(year));
  });
}

function generateTableRow(year) {
  const row = document.createElement("tr");

  const yearCell = row.insertCell(-1);
  yearCell.innerHTML = year.absoluteYear;

  const savingsCell = row.insertCell(-1);
  savingsCell.innerHTML = formatMoney(year.savings);

  const depositCell = row.insertCell(-1);
  depositCell.innerHTML = formatMoney(year.deposit);

  const homeValueCell = row.insertCell(-1);
  homeValueCell.innerHTML = formatMoney(year.homeValue);

  const costsCell = row.insertCell(-1);
  costsCell.innerHTML = formatMoney(year.costs);

  const totalPriceCell = row.insertCell(-1);
  totalPriceCell.innerHTML = formatMoney(year.homeValue + year.costs);

  const ownShareCell = row.insertCell(-1);
  ownShareCell.innerHTML = formatPercent(year.ownShareAfterCosts, false);

  const minimumPayCell = row.insertCell(-1);
  minimumPayCell.innerHTML = formatMoney(year.minimumEarnings);

  return row;
}

function setOutputText(year) {
  const egenandelText = document.getElementById("egenandel-krav-text");
  const boligverdiText = document.getElementById("boligverdi-text");
  const loennText = document.getElementById("loenn-text");

  egenandelText.innerHTML = `Omkostninger + 15% av boligpris (krav om egenandel) spart om ${year.year} år (${year.absoluteYear}).`;
  boligverdiText.innerHTML = `Da er boligen verdt ${formatMoney(
    year.homeValue
  )}.`;
  loennText.innerHTML = `Minste lønn for å ikke låne mer enn fem ganger inntekten er da ${formatMoney(
    year.minimumEarnings
  )}.`;
}

function setDefaultOutputText() {
  const egenandelText = document.getElementById("egenandel-krav-text");
  const boligverdiText = document.getElementById("boligverdi-text");
  const loennText = document.getElementById("loenn-text");

  egenandelText.innerHTML = `Omkostninger + 15% av boligpris (krav om egenandel) ikke spart innen 100 år`;
  boligverdiText.innerHTML = `Da er boligen verdt... mye`;
  loennText.innerHTML = `Minste lønn for å ikke låne mer enn fem ganger inntekten er da... mye.`;
}
