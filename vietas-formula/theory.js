import { FreeCost, FirstFreeCost, LinearCost, ExponentialCost, CustomCost } from "./api/Costs";
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

var pubPower = 0.15;
var tauRate = 0.4;
var pubExp = pubPower / tauRate;
var getTau = () => currency.value.pow(tauRate);
var getCurrencyFromTau = (tau) => [tau.max(BigNumber.ONE).pow(1 / tauRate), currency.symbol];
var getPublicationMultiplier = (tau) => tau.pow(pubExp);
var getPublicationMultiplierFormula = (symbol) => `${symbol}^{${pubExp.toFixed(3)}}`;

var a, b;
var aCost = [
    new ExponentialCost(2.5, Math.log2(1.3)),
    new FirstFreeCost(new ExponentialCost(875, Math.log2(1.4))),
    new ExponentialCost(306250, Math.log2(1.5)),
    new ExponentialCost(111781250, Math.log2(1.6)),
    new ExponentialCost(40800156250, Math.log2(1.7))
];
var bCost = [
    new ExponentialCost(10, Math.log2(15)),
    new ExponentialCost(3500, Math.log2(20)),
    new ExponentialCost(1225000, Math.log2(25)),
    new ExponentialCost(447125000, Math.log2(30)),
    new ExponentialCost(163200625000, Math.log2(35))
];
var e;

var init = () => {
    currency = theory.createCurrency();
    currencyDot = BigNumber.ZERO;

    e = [];

    ///////////////////
    // Regular Upgrades
    a = [];
    b = [];
    for (let i = 1; i <= 5; i++) {
        let id = 2 * (i - 1);

        let aUpgrade = theory.createUpgrade(id, currency, aCost[i - 1]);
        aUpgrade.getDescription = (_) => Utils.getMath(`a_${i} = ${getA(aUpgrade.level)}`);
        aUpgrade.getInfo = (amount) => Utils.getMathTo(`a_${i} = ${getA(aUpgrade.level)}`, `a_${i} = ${getA(aUpgrade.level + amount)}`);
        a.push(aUpgrade);
        
        let bUpgrade = theory.createUpgrade(id + 1, currency, bCost[i - 1]);
        bUpgrade.getDescription = (_) => Utils.getMath(`b_${i} = ${getBDesc(bUpgrade.level)}`);
        bUpgrade.getInfo = (amount) => Utils.getMathTo(`b_${i} = ${getB(bUpgrade.level)}`, `b_${i} = ${getB(bUpgrade.level + amount)}`);
        b.push(bUpgrade);

        e.push(null);
    }

    ///////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e15);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

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
    } else if (a[3].level > 0) {
        e[0] = r0 + r1 + r2 + r3;
        e[1] = r0 * (r1 + r2 + r3) + r1 * (r2 + r3) + r2 * r3;
        e[2] = r0 * (r1 * (r2 + r3) + r2 * r3) + r2 * r3 * r4;
        e[3] = r0 * r1 * r2 * r3;
        e[4] = BigNumber.ZERO;
    } else if (a[2].level > 0) {
        e[0] = r0 + r1 + r2;
        e[1] = r0 * (r1 + r2) + r1 * r2;
        e[2] = r0 * r1 * r2;
        e[3] = e[4] = BigNumber.ZERO;
    } else {
        e[0] = r0 + r1;
        e[1] = r0 * r1;
        e[2] = e[3] = e[4] = BigNumber.ZERO;
    }

    currencyDot = ((1 + e[0]) * (1 + e[1]) * (1 + e[2]) * (1 + e[3]) * (1 + e[4])).abs() * bonus;
    currency.value += currencyDot * dt;
    theory.invalidateTertiaryEquation();
};

var getPrimaryEquation = () => {
    let result = ``;
    result += `e_k = \\sum_{\\substack{I \\subseteq {1, \\cdots, n} \\ |I| = k}} \\prod{i \\in I} {r_{i}}`;
    result += `\\ \\dot{${currency.symbol}} = \\abs{\\prod_{k = 1}^{n} {(1 + e_k)}}`;
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
    return BigNumber.from(1.5).pow(level);
};
var getBDesc = (level) => {
    return `{1.5}^{${level}}`;
};

var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

init();