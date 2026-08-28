import { FreeCost, FirstFreeCost, ConstantCost, LinearCost, ExponentialCost, StepwiseCost, CompositeCost, CustomCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Vector3, Utils } from "./api/Utils";

var id = "iterated_logarithm_convergence";
var getName = (_) => {
    return `Iterated Logarithm Convergence`;
};
var getDescription = (_) => {
    return `You're bored and you decide to take a logarithm of a complex number.
Obviously, you get back a complex number. You take another logarithm, and another, and another...

You expected anything. Maybe unbounded growth, chaotic wandering, or a slow drift to infinity,
but the value converges to a fixed point.

What is the nature of such behaviour? You have decided to explore it further.`;
};
var authors = "BasicallyIAmFox - author, Python's Koala - good N approximation method";
var version = 1;

var currency;
var c1, c2;
var e1, e2, e3, e4;

var epsilonTermMs;
var nBaseMs;
var logBaseMs;
var c1ExpMs;

/*
IteratedLogarithm[b_,n_,x_]:=If[n>=1,IteratedLogarithm[b,n-1,Log[b,x]],x];

x0Internal[b_]:=-ProductLog[-Log[b]] / Log[b];
x0[b_]:=Re[x0Internal[b]]-Im[x0Internal[b]]*Sqrt[-1];
q[b_]:=1/(Abs[x0[b]]*Abs[Log[b]]);
CFactor[b_,n_]:=Abs[IteratedLogarithm[b,n,Sqrt[-1]]-x0[b]]/(q[b]^n);

b:=10;
N[{x0[b],-Log[q[b]],Log[CFactor[b,50]]}, 20]
*/
var logIndex = 0;
var logBaseStr = [`10`, `9.5`, `9`, `8.5`];
var logAttractorPointStr = [`-0.1192+0.7506i`, `-0.1147+0.7639i`, `-0.1095+0.7785i`, `-0.1035+0.7945i`];
var logAttractorPointsConstants = [ // -ln(q), ln(C)
    [0.55958025121547164703, -1.3567399465875839466],
    [0.553346, -1.40365],
    [0.54660087299449209265, -1.4589578628112783156],
    [0.539266, -1.52466],
];
var N;

var init = () => {
    currency = theory.createCurrency();

    ///////////////////
    // Regular Upgrades

    // c1
    {
        let getDesc = (level) => "c_1=" + getC1(level).toString(0);
        let getInfo = (level) => "c_1=" + getC1(level).toString(0);
        c1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(1, Math.log2(2.37))));
        c1.getDescription = (amount) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
    }

    // c2
    {
        let getDesc = (level) => "c_2=2^{" + level + "}";
        let getInfo = (level) => "c_2=" + getC2(level).toString(0);
        c2 = theory.createUpgrade(1, currency, new ExponentialCost(2, Math.log2(2560)));
        c2.getDescription = (amount) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }
    
    // e1
    {
        let getDesc = (level) => "\\epsilon_1=" + getE1(level).toString(0);
        let getInfo = (level) => "\\epsilon_1=" + getE1(level).toString(0);
        e1 = theory.createUpgrade(2, currency, new ExponentialCost(10, Math.log2(5)));
        e1.getDescription = (amount) => Utils.getMath(getDesc(e1.level));
        e1.getInfo = (amount) => Utils.getMathTo(getInfo(e1.level), getInfo(e1.level + amount));
    }

    // e2
    {
        let getDesc = (level) => "\\epsilon_2={2}^{" + level + "}";
        let getInfo = (level) => "\\epsilon_2=" + getE2(level).toString(0);
        e2 = theory.createUpgrade(3, currency, new ExponentialCost(25, Math.log2(1210000)));
        e2.getDescription = (amount) => Utils.getMath(getDesc(e2.level));
        e2.getInfo = (amount) => Utils.getMathTo(getInfo(e2.level), getInfo(e2.level + amount));
    }

    // e3
    {
        let getDesc = (level) => "\\epsilon_3={3}^{" + level + "}";
        let getInfo = (level) => "\\epsilon_3=" + getE3(level).toString(0);
        e3 = theory.createUpgrade(4, currency, new ExponentialCost(1e10, Math.log2(4000000000)));
        e3.getDescription = (amount) => Utils.getMath(getDesc(e3.level));
        e3.getInfo = (amount) => Utils.getMathTo(getInfo(e3.level), getInfo(e3.level + amount));
    }

    // e4
    {
        let getDesc = (level) => "\\epsilon_4={4}^{" + level + "}";
        let getInfo = (level) => "\\epsilon_4=" + getE4(level).toString(0);
        e4 = theory.createUpgrade(5, currency, new ExponentialCost(1e20, Math.log2(190000000000000)));
        e4.getDescription = (amount) => Utils.getMath(getDesc(e4.level));
        e4.getInfo = (amount) => Utils.getMathTo(getInfo(e4.level), getInfo(e4.level + amount));
    }

    ///////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e6);
    theory.createBuyAllUpgrade(1, currency, 1e10);
    theory.createAutoBuyerUpgrade(2, currency, 1e20);
    
    /////////////////////
    // Checkpoint Upgrades
    theory.setMilestoneCost(new CustomCost(total => {
        const costs = [25, 50, 75, 100, 120, 140, 160, 180, 200, 220];
        return BigNumber.from(costs[Math.min(costs.length - 1, total)] * 2);
    }));

    {
        epsilonTermMs = theory.createMilestoneUpgrade(0, 2);
        epsilonTermMs.getDescription = (level) => {
            if (epsilonTermMs.level === 0) {
                return Localization.getUpgradeUnlockDesc(`\\epsilon_3`);
            }
            return Localization.getUpgradeUnlockDesc(`\\epsilon_4`);
        };
        epsilonTermMs.getInfo = (level) => {
            if (epsilonTermMs.level === 0) {
                return Localization.getUpgradeUnlockInfo(`\\epsilon_3`);
            }
            return Localization.getUpgradeUnlockInfo(`\\epsilon_4`);
        };
        epsilonTermMs.canBeRefunded = (_) => nBaseMs.level === 0;
        epsilonTermMs.boughtOrRefunded = (_) => {
            theory.invalidateSecondaryEquation();
            updateAvailability();
        };
    }

    {
        nBaseMs = theory.createMilestoneUpgrade(1, 2);
        nBaseMs.description = `$\\uparrow a$ by 0.01`;
        nBaseMs.info = `Increases $a$ by 0.01`;
        nBaseMs.canBeRefunded = (_) => logBaseMs.level === 0;
        nBaseMs.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            updateAvailability();
        };
    }

    {
        logBaseMs = theory.createMilestoneUpgrade(2, 3);
        logBaseMs.description = `$\\downarrow b$ by 0.5`;
        logBaseMs.info = `Decreases $b$ by 0.5`;
        logBaseMs.boughtOrRefunded = (_) => {
            logIndex = logBaseMs.level;
            theory.invalidateSecondaryEquation();
        };
    }

    {
        c1ExpMs = theory.createMilestoneUpgrade(3, 3);
        c1ExpMs.description = Localization.getUpgradeIncCustomExpDesc(`c_1`, `0.02`);
        c1ExpMs.info = Localization.getUpgradeIncCustomExpInfo(`c_1`, `0.02`);
        c1ExpMs.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
        };
    }

    updateAvailability();
};

var updateAvailability = () => {
    e3.isAvailable = epsilonTermMs.level > 0;
    e4.isAvailable = epsilonTermMs.level > 1;

    nBaseMs.isAvailable = epsilonTermMs.level === 2;
    logBaseMs.isAvailable = nBaseMs.level === 2;
};

var getInternalState = () => JSON.stringify({
    logIndex
});

var setInternalState = (stateStr) => {
    if(!stateStr) return;

    let state = JSON.parse(stateStr);
    logIndex = parseInt(state.logIndex);
};

// Approximates amount of iterations that are needed for value to converge to the fixed point within the epsilon.
var calculateN = (index, epsilon) => {
    const constants = logAttractorPointsConstants[index];

    return ((constants[1] + epsilon.log()) / constants[0]).ceil().max(BigNumber.ZERO);
};

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;

    let vc1 = getC1(c1.level) ** (1 + 0.02 * c1ExpMs.level);
    let vc2 = getC2(c2.level);
    let ve1 = getE1(e1.level);
    let ve2 = getE2(e2.level);
    let ve3 = epsilonTermMs.level > 0 ? getE3(e3.level) : BigNumber.ONE;
    let ve4 = epsilonTermMs.level > 1 ? getE4(e4.level) : BigNumber.ONE;

    let epsilon = ve1 * ve2 * ve3 * ve4;
    let nBase = 1.1;
    if (nBaseMs.level === 1) nBase = 1.11;
    if (nBaseMs.level === 2) nBase = 1.12;

    N = calculateN(logIndex, epsilon);
    currency.value += dt * bonus * vc1 * vc2 * BigNumber.from(nBase).pow(N);

    theory.invalidateTertiaryEquation();
};

var postPublish = () => {
};

var getPrimaryEquation = () => {
    let result = `\\begin{matrix} \\dot{\\rho} = c_1`;
    if (c1ExpMs.level === 1) result += `^{1.02}`;
    if (c1ExpMs.level === 2) result += `^{1.04}`;
    if (c1ExpMs.level === 3) result += `^{1.06}`;
    result += ` c_2 a^N \\\\ a = `;
    if (nBaseMs.level === 0) result += `1.1`;
    if (nBaseMs.level === 1) result += `1.11`;
    if (nBaseMs.level === 2) result += `1.12`;
    result += `\\end{matrix}`
    return result;
};

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 70;
    theory.secondaryEquationScale = 0.9;

    let base = logBaseStr[logIndex];
    let point = logAttractorPointStr[logIndex];

    let epsilon = `\\epsilon_1 \\epsilon_2`;
    if (epsilonTermMs.level > 0) epsilon += ` \\epsilon_3`;
    if (epsilonTermMs.level > 1) epsilon += ` \\epsilon_4`;

    return `\\begin{matrix}
\\log_{b}^{(n)}(z) = \\left\\{ \\begin{array}{cl} z & : \\ n = 0 \\\\ \\log_{b}(\\log_{b}^{(n-1)}(z)) & : \\ n > 0 \\end{array} \\right. \\\\
N = \\min{\\{ n \\in \\mathbb{N} \\ | \\ | \\log_{b}^{(n)}(\\sqrt{-1}) - x_0 | \\leq (${epsilon})^{-1} \\}} \\\\
b = ${base} ,\\ x_0 = \\log_{b}{x_0} \\equiv ${point}
\\end{matrix}`;
};


var getTertiaryEquation = () => {
    return `\\begin{matrix}
${theory.latexSymbol} = \\max \\rho^{2} ,& N = ${N}
\\end{matrix}`;
};

/*var getQuaternaryEntries = () => {
    let quaternaryEntries = [];
    return quaternaryEntries;
};*/

var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getC2 = (level) => BigNumber.TWO.pow(level);
var getE1 = (level) => Utils.getStepwisePowerSum(level, 2, 6, 1);
var getE2 = (level) => BigNumber.from(2).pow(level);
var getE3 = (level) => BigNumber.from(3).pow(level);
var getE4 = (level) => BigNumber.from(4).pow(level);

var getCurrencyFromTau = (tau) => [tau.sqrt(), currency.symbol];
var getTau = () => currency.value.pow(2);
var getPublicationMultiplier = (tau) => tau.pow(0.39) / 1200;
var getPublicationMultiplierFormula = (symbol) => `\\frac{{${symbol}}^{0.39}}{1200}`;
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

init();
