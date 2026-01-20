import { FreeCost, FirstFreeCost, LinearCost, ExponentialCost, CompositeCost, CustomCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "vietas_formula";
var name = "Vieta's Formula";
var description = "A custom theory based on Vieta's Formula.";
var authors = "BasicallyIAmFox";
var version = 1;

var currency;
var currencyDot;
var quaternaryEntries = [];

var pubPower = 0.1;
var tauRate = 0.4;
var pubExp = pubPower / tauRate;
var getTau = () => currency.value.pow(tauRate);
var getCurrencyFromTau = (tau) => [tau.max(BigNumber.ONE).pow(1 / tauRate), currency.symbol];
var getPublicationMultiplier = (tau) => tau.pow(pubExp);
var getPublicationMultiplierFormula = (symbol) => `${symbol}^{${pubExp.toFixed(3)}}`;

var a, b;
var aCost, bCost;
var e;

var init = () => {
    currency = theory.createCurrency();
    currencyDot = BigNumber.ZERO;

    e = [];

    ///////////////////
    // Regular Upgrades
    a = []; aCost = [];
    b = []; bCost = [];
    for (let i = 0; i < 5; i++) {
        let getABaseCost = (i) => {
            let result = 2.5 * Math.pow(350, Math.pow(i, 2));
            if (i >= 2) result /= Math.pow(350 * 350, 1 - (i - 2) / 2);
            return result;
        };
        let getBBaseCost = (i) => {
            let result = 10 * Math.pow(350, Math.pow(i, 2));
            if (i >= 2) result /= Math.pow(350 * 350, 1 - (i - 2) / 2);
            return result;
        };

        let aBaseCost = getABaseCost(i);
        let bBaseCost = getBBaseCost(i);
        let aCostScaling = 3.3 + (0.1 + Math.max(1, 3 * (i - 1))) * i;
        let bCostScaling = 35 + 15 * i;

        aCost.push(new ExponentialCost(aBaseCost, Math.log2(aCostScaling)));
        bCost.push(new ExponentialCost(bBaseCost, Math.log2(bCostScaling)));
        for (let j = Math.max(i + 1, 2); j < 5; j++) {
            let ajBaseCost = getABaseCost(j);
            let bjBaseCost = getBBaseCost(j);

            let aHyperScalingStart = aCost[i].getMax(0, ajBaseCost) + 2;
            let bHyperScalingStart = bCost[i].getMax(0, bjBaseCost) + 2;

            let aCostHyperScaling = Math.log2(aCostScaling) * Math.pow(1.5, j);
            let bCostHyperScaling = Math.log2(bCostScaling) * Math.pow(1.5, j);
            if (j >= 3) {
                aCostHyperScaling *= Math.pow(1.5, j - 2);
                bCostHyperScaling *= Math.pow(1.5, j - 2);
            }

            aCost[i] = new CompositeCost(aHyperScalingStart, aCost[i], new ExponentialCost(aCost[i].getSum(0, aHyperScalingStart), aCostHyperScaling));
            bCost[i] = new CompositeCost(bHyperScalingStart, bCost[i], new ExponentialCost(aCost[i].getSum(0, bHyperScalingStart), bCostHyperScaling));
        }
    }
    aCost[1] = new FirstFreeCost(aCost[1]);
    for (let i = 1; i <= 5; i++) {
        let id = 2 * (i - 1);

        let aUpgrade = theory.createUpgrade(id, currency, aCost[i - 1]);
        aUpgrade.getDescription = (_) => Utils.getMath(`a_${i} = ${getA(aUpgrade.level)}`);
        aUpgrade.getInfo = (amount) => Utils.getMathTo(`a_${i} = ${getA(aUpgrade.level)}`, `a_${i} = ${getA(aUpgrade.level + amount)}`);
        aUpgrade.boughtOrRefunded = (_) => updateAvailability();
        a.push(aUpgrade);
        
        let bUpgrade = theory.createUpgrade(id + 1, currency, bCost[i - 1]);
        bUpgrade.getDescription = (_) => Utils.getMath(`b_${i} = ${getBDesc(bUpgrade.level)}`);
        bUpgrade.getInfo = (amount) => Utils.getMathTo(`b_${i} = ${getB(bUpgrade.level)}`, `b_${i} = ${getB(bUpgrade.level + amount)}`);
        b.push(bUpgrade);

        e.push(null);
    }

    ///////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e16);
    theory.createBuyAllUpgrade(1, currency, 1e30);
    theory.createAutoBuyerUpgrade(2, currency, 1e50);

    /////////////////////
    // Checkpoint Upgrades
    theory.setMilestoneCost(new LinearCost(25, 25));

    updateAvailability();
};

var updateAvailability = () => {
    a[2].isAvailable = b[2].isAvailable = a[1].level > 0;
    a[3].isAvailable = b[3].isAvailable = a[2].level > 0;
    a[4].isAvailable = b[4].isAvailable = a[3].level > 0;
};

var tick = (elapsedTime, multiplier) => {
    if (a[1].level == 0) return;

    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;

    let a0 = getA(a[0].level), b0 = getB(b[0].level);
    let a1 = getA(a[1].level), b1 = getB(b[1].level);
    let a2 = getA(a[2].level), b2 = getB(b[2].level);
    let a3 = getA(a[3].level), b3 = getB(b[3].level);
    let a4 = getA(a[4].level), b4 = getB(b[4].level);
    let r0 = a0 * b0, r1 = a1 * b1, r2 = a2 * b2, r3 = a3 * b3, r4 = a4 * b4;
    if (a[4].level > 0) {
        e[0] = r0 + r1 + r2 + r3 + r4;
        e[1] = r0 * (r1 + r2 + r3 + r4) + r1 * (r2 + r3 + r4) + r2 * (r3 + r4) + r3 * r4;
        e[2] = r0 * (r1 * (r2 + r3 + r4) + r2 * (r3 + r4) + r3 * r4) + r1 * (r2 * (r3 + r4) + r3 * r4) + r2 * r3 * r4;
        e[3] = r0 * (r1 * (r2 * (r3 + r4) + r3 * r4) + r2 * r3 * r4) + r1 * r2 * r3 * r4;
        e[4] = r0 * r1 * r2 * r3 * r4;
        currencyDot = e[0] * e[1] * e[2] * e[3] * e[4];
    } else if (a[3].level > 0) {
        e[0] = r0 + r1 + r2 + r3;
        e[1] = r0 * (r1 + r2 + r3) + r1 * (r2 + r3) + r2 * r3;
        e[2] = r0 * (r1 * (r2 + r3) + r2 * r3) + r2 * r3 * r4;
        e[3] = r0 * r1 * r2 * r3;
        e[4] = BigNumber.ZERO;
        currencyDot = e[0] * e[1] * e[2] * e[3];
    } else if (a[2].level > 0) {
        e[0] = r0 + r1 + r2;
        e[1] = r0 * (r1 + r2) + r1 * r2;
        e[2] = r0 * r1 * r2;
        e[3] = e[4] = BigNumber.ZERO;
        currencyDot = e[0] * e[1] * e[2];
    } else {
        e[0] = r0 + r1;
        e[1] = r0 * r1;
        e[2] = e[3] = e[4] = BigNumber.ZERO;
        currencyDot = e[0] * e[1];
    }
    currencyDot = currencyDot.max(BigNumber.ONE).abs() * bonus;

    currency.value += currencyDot * dt;
    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();
};

var getPrimaryEquation = () => {
    theory.primaryEquationScale = 0.9;
    theory.primaryEquationHeight = 120;

    let result = `\\begin{array}{cl}`;
    result += `\\dot{${currency.symbol}} = |\\prod_{k = 1}^{n} {e_k}|`;
    result += `\\\\ e_k = \\sum_{I \\subseteq \\{1, \\cdots, n \\} \\\\ |I| = k} \\prod_{i \\in I} {r_{i}}`;
    result += `\\end{array}`;
    return result;
};

var getSecondaryEquation = () => {
    let result = `\\begin{matrix}`;
    result += `${theory.latexSymbol}=\\max{${currency.symbol}}^{${tauRate}}`;
    result += `,& r_{i} = a_{i}b_{i}`;
    result += `\\end{matrix}`;
    return result;
};

var getTertiaryEquation = () => {
    let result = `\\begin{matrix}`;
    if (a[4].level > 0) {
        result += `n = 5`;
    } else if (a[3].level > 0) {
        result += `n = 4`;
    } else if (a[2].level > 0) {
        result += `n = 3`;
    } else if (a[1].level > 0) {
        result += `n = 2`;
    } else if (a[0].level > 0) {
        result += `n = 1`;
    } else {
        result += `n = 0`;
    }
    result += `,& \\dot{${currency.symbol}} = ${currencyDot}`;
    result += `\\end{matrix}`;
    return result;
};

var getQuaternaryEntries = () => {
    if (quaternaryEntries.length == 0) {
        quaternaryEntries.push(new QuaternaryEntry(`e_1`, null));
        quaternaryEntries.push(new QuaternaryEntry(`e_2`, null));
        quaternaryEntries.push(new QuaternaryEntry(`e_3`, null));
        quaternaryEntries.push(new QuaternaryEntry(`e_4`, null));
        quaternaryEntries.push(new QuaternaryEntry(`e_5`, null));
    }
    let flags = [ e[4] && e[4] > 0 ];
    flags.push(flags[flags.length - 1] || e[3] && e[3] > 0);
    flags.push(flags[flags.length - 1] || e[2] && e[2] > 0);
    flags.push(flags[flags.length - 1] || e[1] && e[1] > 0);
    flags.push(flags[flags.length - 1] || e[0] && e[0] > 0);
    flags.reverse();
    quaternaryEntries[0].value = flags[0] ? e[0].toString() : null;
    quaternaryEntries[1].value = flags[1] ? e[1].toString() : null;
    quaternaryEntries[2].value = flags[2] ? e[2].toString() : null;
    quaternaryEntries[3].value = flags[3] ? e[3].toString() : null;
    quaternaryEntries[4].value = flags[4] ? e[4].toString() : null;
    return quaternaryEntries;
};

var getA = (level) => {
    return Utils.getStepwisePowerSum(level, 2, 10, 0);
};

var getB = (level) => {
    return BigNumber.from(1.3).pow(level);
};
var getBDesc = (level) => {
    return `{1.3}^{${level}}`;
};

var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

init();