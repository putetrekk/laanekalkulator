sliders = document.getElementsByClassName("slider");

console.log(sliders);
Array.prototype.forEach.call(sliders, (element) =>
  element.addEventListener("change", calculate_loan)
);

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

const omkostningerAndelSlider = document.getElementById(
  "omkostninger-andel-slider"
);
const omkostningerAndelDisplay = document.getElementById(
  "omkostninger-andel-display"
);
omkostningerAndelSlider.addEventListener("input", () => {
  omkostninger = omkostningerAndelSlider.value;
  omkostningerAndelDisplay.innerHTML = `${omkostninger} (${roundToDecimals(
    omkostninger * 100,
    1
  )}%)`;
});

console.log("script initialisation complete");

function calculate_loan() {
  const initialSavings = parseInt(startkapitalSlider.value);
  const initialDeposit = innskuddSlider.value * 12;
  const depositAdjustment = innskuddEndringSlider.value;
  const depositInterest = innskuddRenteSlider.value;
  const initialHomeValue = parseInt(boligprisSlider.value);
  const homeValueChange = boligEndringSlider.value;

  const incrementYear = (year, savings, deposit, homeValue) => [
    year + 1,
    savings * depositInterest + deposit,
    deposit * depositAdjustment,
    homeValue * homeValueChange,
  ];

  let year = 0;

  const hist = [[year, initialSavings, initialDeposit, initialHomeValue]];

  console.log(hist);

  while (year < 100) {
    hist.push(incrementYear(...hist[year]));
    year += 1;
  }

  makeChart(hist);
  generateTable(hist);
  const whenMetOwnShare = hist.find(
    (item) =>
      item[1] - item[3] * omkostningerAndelSlider.value >= item[3] * 0.15
  );
  if (whenMetOwnShare) {
    setOutputText(...whenMetOwnShare);
  } else {
    setDefaultOutputText();
  }
}

function makeChart(history) {
  const hist = history.slice(0, 21);
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
        rangeDescription: "Range: 2010 to 2017",
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
        pointStart: hist[0][0] + new Date().getFullYear(),
      },
    },

    series: [
      {
        name: "Boligpris",
        data: hist.map((item) => item[3]),
      },
      {
        name: "Krav egenandel",
        data: hist.map((item) => {
          const price = item[3];
          const costs = price * omkostningerAndelSlider.value;
          return price * 0.15 + costs;
        }),
      },
      {
        name: "Oppspart",
        data: hist.map((item) => item[1]),
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
    "Egenandel",
    "Lønn (<sup>Lånesum</sup>&frasl;<sub>5</sub>)",
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

  const costsShare = omkostningerAndelSlider.value;
  const costs = homeValue * costsShare;
  const costsCell = document.createElement("td");
  costsCell.innerHTML = separateThousands(Math.round(costs));
  row.appendChild(costsCell);

  const totalPrice = homeValue + costs;
  const totalPriceCell = document.createElement("td");
  totalPriceCell.innerHTML = separateThousands(Math.round(totalPrice));
  row.appendChild(totalPriceCell);

  const ownShare = roundToDecimals(((savings - costs) / totalPrice) * 100, 1);
  const ownShareCell = document.createElement("td");
  ownShareCell.innerHTML = `${ownShare}%`;
  row.appendChild(ownShareCell);

  const minimumPay = separateThousands(Math.round((totalPrice - savings) / 5));
  const minimumPayCell = document.createElement("td");
  minimumPayCell.innerHTML = minimumPay;
  row.appendChild(minimumPayCell);

  return row;
}

function setOutputText(years, savings, deposit, homeValue) {
  const currentYear = new Date().getFullYear();
  const goalYear = currentYear + years;

  const costsShare = omkostningerAndelSlider.value;
  const costs = homeValue * costsShare;
  const loanAmount = homeValue - savings - costs;
  const minimumPay = Math.round(loanAmount / 5);

  egenandelText = document.getElementById("egenandel-krav-text");
  boligverdiText = document.getElementById("boligverdi-text");
  loennText = document.getElementById("loenn-text");

  egenandelText.innerHTML = `Omkostninger + 15% av boligpris (krav om egenandel) spart om ${years} år (${goalYear}).`;
  boligverdiText.innerHTML = `Da er boligen verdt ${separateThousands(
    Math.round(homeValue)
  )}.`;
  loennText.innerHTML = `Minste lønn for å ikke låne mer enn fem ganger inntekten er da ${separateThousands(
    minimumPay
  )}.`;
}

function setDefaultOutputText(){
  egenandelText = document.getElementById("egenandel-krav-text");
  boligverdiText = document.getElementById("boligverdi-text");
  loennText = document.getElementById("loenn-text");

  egenandelText.innerHTML = `Omkostninger + 15% av boligpris (krav om egenandel) ikke spart innen 100 år`;
  boligverdiText.innerHTML = `Da er boligen verdt... mye`;
  loennText.innerHTML = `Minste lønn for å ikke låne mer enn fem ganger inntekten er da... mye.`;
};

function separateThousands(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function roundToDecimals(number, decimals) {
  const fac = Math.pow(10, decimals);
  return Math.round(number * fac) / fac;
}
