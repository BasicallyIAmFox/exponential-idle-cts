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

var pubPower = 0.15;
var tauRate = 0.3;
var pubExp = pubPower / tauRate;
var pubDivisor = 5;
var getTau = () => currency.value.pow(tauRate);
var getCurrencyFromTau = (tau) => [tau.max(BigNumber.ONE).pow(1 / tauRate), currency.symbol];
var getPublicationMultiplier = (tau) => tau.pow(pubExp) / pubDivisor;
var getPublicationMultiplierFormula = (symbol) => `\\frac{${symbol}^{${pubExp.toFixed(3)}}}{${pubDivisor}}`;

var t;
var tdot;

var a, b;
var aCost = [
    new FirstFreeCost(new ExponentialCost(5, 2)),
    new ExponentialCost(5, 2),
    new ExponentialCost(5, 2),
    new ExponentialCost(5, 4),
    new ExponentialCost(5, 5)
], bCost = [
    new ExponentialCost(50, 500),
    new ExponentialCost(50, 500),
    new ExponentialCost(50, 500),
    new ExponentialCost(50, 500),
    new ExponentialCost(50, 500)
];
var e_k, n;

var aiPerma;
var biPerma;

var aiMs;
var biMs;
var aiExpMs;

var init = () => {
    currency = theory.createCurrency();
    currencyDot = BigNumber.ZERO;

    t = BigNumber.ZERO;

    e_k = [];
    n = 0;

    ///////////////////
    // Regular Upgrades

    {
        let tdot = theory.createUpgrade(0, currency, new ExponentialCost(1e5, Math.log2(1e5)));
        tdot.getDescription = (_) => Utils.getMath(`\\dot{t} = ${getTdot(tdot.level)}`);
        tdot.getInfo = (amount) => Utils.getMathTo(`\\dot{t} = ${getTdot(tdot.level)}`, `\\dot{t} = ${getTdot(tdot.level + amount)}`);
        tdot.boughtOrRefunded = (_) => updateAvailability();
        tdot.maxLevel = 4;
    }

    a = [];
    b = [];
    for (let i = 1; i <= 5; i++) {
        let id = 1 + 2 * (i - 1);

        let aUpgrade = theory.createUpgrade(id, currency, aCost[i - 1]);
        aUpgrade.getDescription = (_) => Utils.getMath(`a_${i} = ${getA(aUpgrade.level)}`);
        aUpgrade.getInfo = (amount) => Utils.getMathTo(`a_${i} = ${getA(aUpgrade.level)}`, `a_${i} = ${getA(aUpgrade.level + amount)}`);
        aUpgrade.boughtOrRefunded = (_) => updateAvailability();
        a.push(aUpgrade);
        
        let bUpgrade = theory.createUpgrade(id + 1, currency, bCost[i - 1]);
        bUpgrade.getDescription = (_) => Utils.getMath(`b_${i} = ${getBDesc(bUpgrade.level)}`);
        bUpgrade.getInfo = (amount) => Utils.getMathTo(`b_${i} = ${getB(bUpgrade.level)}`, `b_${i} = ${getB(bUpgrade.level + amount)}`);
        b.push(bUpgrade);

        e_k.push(null);
    }

    ///////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e8);
    theory.createBuyAllUpgrade(1, currency, 1e15);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    {
        aiPerma = theory.createPermanentUpgrade(3, currency, new CustomCost(level => {
            const cost = 15;
            cost = Math.pow(cost, level);
            return BigNumber.TEN.pow(cost);
        }));
        aiPerma.getDescription = (_) => `Unlock ${Utils.getMath(`a`)} milestone lv ${aiPerma.level + 1}`;
        aiPerma.getInfo = (_) => `Milestone: ${Localization.getUpgradeUnlockInfo(`a_${aiPerma.level + 4}`)}`;
        aiPerma.maxLevel = 2;
        aiPerma.boughtOrRefunded = (_) => updateAvailability();
    }

    {
        biPerma = theory.createPermanentUpgrade(4, currency, new CustomCost(level => {
            const cost = 10;
            if (level >= 1) cost += 25;
            if (level >= 2) cost += 50;
            if (level >= 3) cost += 100;
            return BigNumber.TEN.pow(cost);
        }));
        biPerma.getDescription = (_) => `Unlock ${Utils.getMath(`b`)} milestone lv ${biPerma.level + 1}`;
        biPerma.getInfo = (_) => `Milestone: ${Localization.getUpgradeUnlockInfo(`b_${biPerma.level + 3}`)}`;
        biPerma.maxLevel = 3;
        biPerma.boughtOrRefunded = (_) => updateAvailability();
    }

    /////////////////////
    // Checkpoint Upgrades
    theory.setMilestoneCost(new LinearCost(25, 25));

    {
        aiMs = theory.createMilestoneUpgrade(0, 2);
        aiMs.getDescription = (_) => Localization.getUpgradeUnlockDesc(`a_${4 + aiMs.level}`);
        aiMs.getInfo = (_) => Localization.getUpgradeUnlockInfo(`a_${4 + aiMs.level}`);
        aiMs.isAvailable = false;
        aiMs.boughtOrRefunded = (_) => updateAvailability();
    }

    {
        biMs = theory.createMilestoneUpgrade(1, 3);
        biMs.getDescription = (_) => Localization.getUpgradeUnlockDesc(`b_${3 + biMs.level}`);
        biMs.getInfo = (_) => Localization.getUpgradeUnlockInfo(`b_${3 + biMs.level}`);
        biMs.isAvailable = false;
        biMs.boughtOrRefunded = (_) => updateAvailability();
    }

    {
        aiExpMs = theory.createMilestoneUpgrade(2, 3);
        aiExpMs.description = Localization.getUpgradeIncCustomExpDesc("a_i", "0.03");
        aiExpMs.info = Localization.getUpgradeIncCustomExpInfo("a_i", "0.03");
        aiExpMs.boughtOrRefunded = (_) => theory.invalidateSecondaryEquation();
    }

    updateAvailability();
};

var updateAvailability = () => {
    a[0].isAvailable = true;
    a[1].isAvailable = true;
    a[2].isAvailable = true;
    a[3].isAvailable = aiMs.level > 0;
    a[4].isAvailable = aiMs.level > 1;
    b[0].isAvailable = true;
    b[1].isAvailable = true;
    b[2].isAvailable = biMs.level > 0;
    b[3].isAvailable = biMs.level > 1;
    b[4].isAvailable = biMs.level > 2;

    aiMs.maxLevel = aiPerma.level;
    aiMs.isAvailable = aiPerma.level > 0;
    biMs.maxLevel = biPerma.level;
    biMs.isAvailable = biPerma.level > 0;
};

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;

    let aiExp = 1 + 0.03 * aiExpMs.level;
    let a0 = getA(a[0].level).pow(aiExp), b0 = getB(b[0].level);
    let a1 = getA(a[1].level).pow(aiExp), b1 = getB(b[1].level);
    let a2 = getA(a[2].level).pow(aiExp), b2 = getB(b[2].level);
    let a3 = getA(a[3].level).pow(aiExp), b3 = getB(b[3].level);
    let a4 = getA(a[4].level).pow(aiExp), b4 = getB(b[4].level);
    let r0 = a0 * b0, r1 = a1 * b1, r2 = a2 * b2, r3 = a3 * b3, r4 = a4 * b4;
    if (a[4].level > 0) {
        e_k[0] = r0 + r1 + r2 + r3 + r4;
        e_k[1] = r0 * (r1 + r2 + r3 + r4) + r1 * (r2 + r3 + r4) + r2 * (r3 + r4) + r3 * r4;
        e_k[2] = r0 * (r1 * (r2 + r3 + r4) + r2 * (r3 + r4) + r3 * r4) + r1 * (r2 * (r3 + r4) + r3 * r4) + r2 * r3 * r4;
        e_k[3] = r0 * (r1 * (r2 * (r3 + r4) + r3 * r4) + r2 * r3 * r4) + r1 * r2 * r3 * r4;
        e_k[4] = r0 * r1 * r2 * r3 * r4;
        n = 5;
    } else if (a[3].level > 0) {
        e_k[0] = r0 + r1 + r2 + r3;
        e_k[1] = r0 * (r1 + r2 + r3) + r1 * (r2 + r3) + r2 * r3;
        e_k[2] = r0 * (r1 * (r2 + r3) + r2 * r3) + r1 * r2 * r3;
        e_k[3] = r0 * r1 * r2 * r3;
        e_k[4] = BigNumber.ZERO;
        n = 4;
    } else if (a[2].level > 0) {
        e_k[0] = r0 + r1 + r2;
        e_k[1] = r0 * (r1 + r2) + r1 * r2;
        e_k[2] = r0 * r1 * r2;
        e_k[3] = e_k[4] = BigNumber.ZERO;
        n = 3;
    } else if (a[1].level > 0) {
        e_k[0] = r0 + r1;
        e_k[1] = r0 * r1;
        e_k[2] = e_k[3] = e_k[4] = BigNumber.ZERO;
        n = 2;
    } else if (a[0].level > 0) {
        e_k[0] = r0;
        e_k[1] = e_k[2] = e_k[3] = e_k[4] = BigNumber.ZERO;
        n = 1;
    } else {
        e_k[0] = e_k[1] = e_k[2] = e_k[3] = e_k[4] = BigNumber.ZERO;
        n = 0;
    }

    if (n == 0) {
        currencyDot = BigNumber.ZERO;
    } else {
        currencyDot = BigNumber.ONE;
        for (let i = 0; i < n; i++) {
            currencyDot *= e_k[i].pow(2 / (2 + i));
        }
        currencyDot = currencyDot.abs() * bonus;
    }

    t += getTdot(tdot.level) * dt;
    currency.value += t.max(BigNumber.ONE) * currencyDot * dt;
    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();
};

var postPublish = () => {
    updateAvailability();
};

var getPrimaryEquation = () => {
    theory.primaryEquationScale = 0.9;
    theory.primaryEquationHeight = 120;

    let result = `\\begin{array}{cl}`;
    result += `\\dot{${currency.symbol}} = |\\prod_{k = 1}^{n} {e_{k}^{\\frac{2}{1 + k}}}|`;
    result += `\\\\ \\\\`; // Intentional double newline
    result += `e_k = \\sum_{\\begin{array}{cl} I \\subseteq \\{1, \\cdots, n \\} \\\\ |I| = k \\end{array}} \\prod_{i \\in I} {r_{i}}`;
    result += `\\end{array}`;
    return result;
};

var getSecondaryEquation = () => {
    let result = `\\begin{matrix}`;
    result += `${theory.latexSymbol}=\\max{${currency.symbol}}^{${tauRate}}`;
    result += `,& r_{i} = a_{i}`;
    switch (aiExpMs.level) {
        case 0: break;
        case 1: result += `^{1.03}`; break;
        case 2: result += `^{1.06}`; break;
        case 3: result += `^{1.09}`; break;
    }
    result += `b_{i}`;
    result += `\\end{matrix}`;
    return result;
};

var getTertiaryEquation = () => {
    let result = `\\begin{matrix}`;
    result += `\\dot{${currency.symbol}} = ${currencyDot} ,& \\dot{t} = ${getTdot(tdot.level)} \\\\ n = ${n}`;
    result += `\\end{matrix}`;
    return result;
};

let _quaternary_entries_cache_flags = [];
var getQuaternaryEntries = () => {
    if (quaternaryEntries.length == 0) {
        quaternaryEntries.push(new QuaternaryEntry(`e_1`, null));
        quaternaryEntries.push(new QuaternaryEntry(`e_2`, null));
        quaternaryEntries.push(new QuaternaryEntry(`e_3`, null));
        quaternaryEntries.push(new QuaternaryEntry(`e_4`, null));
        quaternaryEntries.push(new QuaternaryEntry(`e_5`, null));
    }
    if (_quaternary_entries_cache_flags.length == 0) {
        _quaternary_entries_cache_flags.push(false);
        _quaternary_entries_cache_flags.push(false);
        _quaternary_entries_cache_flags.push(false);
        _quaternary_entries_cache_flags.push(false);
        _quaternary_entries_cache_flags.push(false);
    }
    _quaternary_entries_cache_flags[4] = e_k[4] && e_k[4] > 0;
    _quaternary_entries_cache_flags[3] = _quaternary_entries_cache_flags[4] || e_k[3] && e_k[3] > 0;
    _quaternary_entries_cache_flags[2] = _quaternary_entries_cache_flags[3] || e_k[2] && e_k[2] > 0;
    _quaternary_entries_cache_flags[1] = _quaternary_entries_cache_flags[2] || e_k[1] && e_k[1] > 0;
    _quaternary_entries_cache_flags[0] = _quaternary_entries_cache_flags[1] || e_k[0] && e_k[0] > 0;
    quaternaryEntries[0].value = _quaternary_entries_cache_flags[0] ? e_k[0].toString() : null;
    quaternaryEntries[1].value = _quaternary_entries_cache_flags[1] ? e_k[1].toString() : null;
    quaternaryEntries[2].value = _quaternary_entries_cache_flags[2] ? e_k[2].toString() : null;
    quaternaryEntries[3].value = _quaternary_entries_cache_flags[3] ? e_k[3].toString() : null;
    quaternaryEntries[4].value = _quaternary_entries_cache_flags[4] ? e_k[4].toString() : null;
    return quaternaryEntries;
};

var getA = (level) => {
    return Utils.getStepwisePowerSum(level, 2, 10, 0);
};

const ONE_POINT_THREE = BigNumber.from(1.3);
var getB = (level) => {
    return ONE_POINT_THREE.pow(level);
};
var getBDesc = (level) => {
    return `{${ONE_POINT_THREE}}^{${level}}`;
};

var getTdot = (level) => {
    return BigNumber.from(0.25 + 0.25 * level);
};

var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

init();