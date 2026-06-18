var id = "logistic-volume";
var getName = (_) => {
    return `Logistic Volume`;
};
var getDescription = (_) => {
    return `funny yact`;
};
var authors = "BasicallyIAmFox";
var version = 1;

var currency;

var kappa1, kappa2, kappa3;

var q1_1 = BigNumber.ONE, q1_2 = BigNumber.ONE, q1_3 = BigNumber.ONE;

var init = () => {
    currency = theory.createCurrency();

    // Regular Upgrades

    {
        let getDesc = (level) => `\\kappa_1=2^{${level}}`;
        let getInfo = (level) => `\\kappa_1=${getKappa1(level).toString(0)}`;
        kappa1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(10 ** 1, Math.log2(5))));
        kappa1.getDescription = (_) => Utils.getMath(getDesc(kappa1.level));
        kappa1.getInfo = (amount) => Utils.getMathTo(getInfo(kappa1.level), getInfo(kappa1.level + amount));
    }

    {
        let getDesc = (level) => `\\kappa_2=3^{${level}} - 1`;
        let getInfo = (level) => `\\kappa_2=${getKappa2(level).toString(0)}`;
        kappa2 = theory.createUpgrade(1, currency, new ExponentialCost(10 ** 2, Math.log2(25)));
        kappa2.getDescription = (_) => Utils.getMath(getDesc(kappa2.level));
        kappa2.getInfo = (amount) => Utils.getMathTo(getInfo(kappa2.level), getInfo(kappa2.level + amount));
    }

    {
        let getDesc = (level) => `\\kappa_3=4^{${level}} - 1`;
        let getInfo = (level) => `\\kappa_3=${getKappa3(level).toString(0)}`;
        kappa3 = theory.createUpgrade(2, currency, new ExponentialCost(10 ** 4, Math.log2(125)));
        kappa3.getDescription = (_) => Utils.getMath(getDesc(kappa3.level));
        kappa3.getInfo = (amount) => Utils.getMathTo(getInfo(kappa3.level), getInfo(kappa3.level + amount));
    }
    
    // Permanent Upgrades
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e20);

};

var getInternalState = () => JSON.stringify({
    q1_1: q1_1.toBase64String(),
    q1_2: q1_2.toBase64String(),
    q1_3: q1_3.toBase64String(),
});

var setInternalState = (stateStr) => {
    if(!stateStr) return;

    let state = JSON.parse(stateStr);
    q1_1 = BigNumber.fromBase64String(state.q1_1);
    q1_2 = BigNumber.fromBase64String(state.q1_2);
    q1_3 = BigNumber.fromBase64String(state.q1_3);
};

var tick = (elapsedTime, multiplier) => {
    if (kappa1.level === 0) return;

    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;

    const getQdot = (k, m, value, cap, capMulti) => {
        return value.pow(1 / k) * (capMulti - value / cap).pow(m) / cap;
    };
    const getNewQ = (k, m, value, cap, capMulti) => {
        if (cap === BigNumber.ZERO) return BigNumber.ZERO;

        const qdot = getQdot(k, m, value, cap, capMulti);
        return (value + dt * qdot).min(cap * capMulti);
    };

    q1_3 = getNewQ(3, 1, q1_3, getKappa3(kappa3.level), 1).max(BigNumber.ONE);
    q1_2 = getNewQ(2, 1, q1_2, getKappa2(kappa2.level), q1_3).max(BigNumber.ONE);
    q1_1 = getNewQ(1, 1, q1_1, getKappa1(kappa1.level), q1_2).max(BigNumber.ONE);

    currency.value += dt * bonus * q1_1.pow(1 / 3) * q1_2.pow(1 / 2) * q1_3;
    theory.invalidateSecondaryEquation();
};

var getPrimaryEquation = () => {
    theory.primaryEquationHeight = 60;

    let result = ``;
    result += `\\dot{{}^k_m q_n} = \\frac{\\sqrt[k]{{}^k_m q_n}}{\\kappa_k} ({{}^{k + 1}_m q_n} - \\frac{{{}^k_m q_n}}{\\kappa_k})^{m}`;
    return result;
};

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 80;

    return `\\begin{matrix}
{{}^1_1 q_n} = ${q1_1.toString(2)} \\\\
{{}^2_1 q_n} = ${q1_2.toString(2)} \\\\
{{}^3_1 q_n} = ${q1_3.toString(2)} \\\\
\\end{matrix}`;
};

var getTertiaryEquation = () => {
    return ``;
};

var getKappa1 = (level) => BigNumber.TWO.pow(level);
var getKappa2 = (level) => BigNumber.THREE.pow(level) - 1;
var getKappa3 = (level) => BigNumber.FOUR.pow(level) - 1;

var getPublicationMultiplier = (tau) => tau.pow(0.2);
var getPublicationMultiplierFormula = (symbol) => `{${symbol}}^{0.2}`;
var getTau = () => currency.value;
var getCurrencyFromTau = (tau) => [ tau.max(BigNumber.ONE), currency.symbol ];
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

init();