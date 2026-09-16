var id = "theory_of_everything";
var getName = (_) => {
    return `Theory of Everything`;
};
var getDescription = (_) => {
    return `funny yact`;
};
var authors = "BasicallyIAmFox";
var version = 0;

var stage = 0;
var localDeltaTime = BigNumber.ZERO;
var achievement1, achievement2, achievement3, achievement5, achievement6, achievement4;

var stringTickspeed = (value) => `\\text{Tickspeed} : \\text{${value}} \\text{ / sec}`;
var t = BigNumber.ZERO;
var tickspeed;
var tickspeedConsts = [
    11 / (2 ** 10),
    10 / (2 ** 9),
    9 / (2 ** 8),
    8 / (2 ** 7),
    7 / (2 ** 6),
    6 / (2 ** 5),
    5 / (2 ** 4),
    4 / (2 ** 3),
    3 / (2 ** 2),
    2 / (2 ** 1),
];

var currency;
var maxRho = BigNumber.ZERO;

// q variables
const qBaseDecay = 100;
const qBaseDecayStr = `100`;
var q1 = BigNumber.ZERO, q2 = BigNumber.ZERO, q3 = BigNumber.ONE, q4 = BigNumber.ONE;
var dq1, dq2, dq3, dq4;
var visual_drho = BigNumber.ZERO;
var visual_dq1 = BigNumber.ZERO, visual_dq2 = BigNumber.ZERO, visual_dq3 = BigNumber.ZERO, visual_dq4 = BigNumber.ZERO;
var getQDecay = () => {
    let result = qBaseDecay + getGammaUpgGammaQDecay();

    if (conjectureActiveData.id === 0) {
        result /= conjectures[0].getPenalty(conjectureActiveData.difficulty);
    }
    if (conjecturesHighestCompletedDifficulties[0] > 0) {
        result *= conjectures[0].getReward(conjecturesHighestCompletedDifficulties[0]);
    }

    return result;
};
var getQDecayLatex = () => {
    let result = qBaseDecayStr;
    if (gammaup_gammaQDecay.level > 0) result = `${result} + \\gamma_5`;

    if (conjecturesHighestCompletedDifficulties[0] > 0) {
        result = `${conjectures[0].getRewardStr(conjecturesHighestCompletedDifficulties[0])} (${result})`;
    }

    return result;
}

// Gamma variables
const gammaGainBaseScaling = 0.2;
const gammaGainBaseScalingStr = `0.2`;
const gammaGainRhoThreshold = 1000;
const gammaGainRhoThresholdStr = `1000`;
var gammaCurrency;
var gammaCurrencyTotal = BigNumber.ZERO;
var gammaResets = 0;
var gammaup_gammaMult, gammaup_gammaTimeMult, gammaup_gammaTickspeed, gammaup_gammaDQ2Factor, gammaup_gammaQDecay, gammaup_gammaGainExp;
var gammaup_gammaDQ1Scaling;
var getGammaGainScaling = () => gammaGainBaseScaling + getGammaUpgGammaGainExp();
var getGammaGainScalingLatex = () => `${gammaGainBaseScalingStr} + \\gamma_6`;
var getGammaGainRhoThreshold = () => gammaGainRhoThreshold;
var getGammaGainRhoThresholdLatex = () => gammaGainRhoThresholdStr;

var conjectureActiveData = {
    ["id"]: -1,
    ["difficulty"]: -1,
};
var conjecturesHighestCompletedDifficulties = [0, 0, 0, 0];
var conjectures = [
    {
        maxDifficulty: 3,
        name: () => `Conjecture 1`,
        goal: (difficulty) => {
            if (difficulty === 1) return BigNumber.from(1e8);
            if (difficulty === 2) return BigNumber.from(1e10);
            if (difficulty === 3) return BigNumber.from(1e12);
        },
        penalty: (difficulty) => `$q \\text{ decay} \\times ${conjectures[0].getPenaltyStr(difficulty)}$`,
        reward: (difficulty) => `$q \\text{ decay} \\div 1.2^{${difficulty}}$`,

        getPenalty(difficulty) {
            return [0, 5, 10, 20][difficulty];
        },
        getPenaltyStr(difficulty) {
            return [`0`, `5`, `10`, `20`][difficulty];
        },
        getReward(difficulty) {
            return BigNumber.from(1.2).pow(difficulty);
        },
        getRewardStr(difficulty) {
            return `1.2^{${difficulty}}`;
        },
    },
    {
        maxDifficulty: 3,
        name: () => `Conjecture 2`,
        goal: (difficulty) => {
            if (difficulty === 1) return BigNumber.from(1e7);
            if (difficulty === 2) return BigNumber.from(1e9);
            if (difficulty === 3) return BigNumber.from(1e11);
        },
        penalty: (difficulty) => {
            if (difficulty === 1) {
                return `$q_4$ starts at $0$.`;
            } else if (difficulty === 2) {
                return `$q_4$, $q_3$ start at $0$, $q_2$ starts at $1$.`;
            } else {
                return `$q_4$, $q_3$, $q_2$ start at $0$, $q_1$ starts at $1$.`;
            }
        },
        reward: (difficulty) => `Base $q_3$, $q_4$ value $\\times ${conjectures[1].getRewardStr(difficulty)}$.`,

        getReward(difficulty) {
            return BigNumber.from(2).pow(difficulty);
        },
        getRewardStr(difficulty) {
            return `2^{${difficulty}}`;
        },
        onStart: (difficulty) => {
            if (difficulty === 1) {
                q4 = BigNumber.ZERO;
            } else if (difficulty === 2) {
                q4 = BigNumber.ZERO;
                q3 = BigNumber.ZERO;
                q2 = BigNumber.ONE;
            } else if (difficulty === 3) {
                q4 = BigNumber.ZERO;
                q3 = BigNumber.ZERO;
                q2 = BigNumber.ZERO;
                q1 = BigNumber.ONE;
            }
        },
    },
    {
        maxDifficulty: 3,
        name: () => `Conjecture 3`,
        goal: (difficulty) => {
            if (difficulty === 1) return BigNumber.from(1e8);
            if (difficulty === 2) return BigNumber.from(1e10);
            if (difficulty === 3) return BigNumber.from(1e11);
        },
        penalty: (difficulty) => `$q_1$ term in $\\dot{\\rho}$ is replaced with $q_${difficulty + 1}$`,
        reward: (difficulty) => `$${difficulty === 0 ? `1` : `\\prod_{i = 2}^{${difficulty + 1}} \\max \\left( 1, q_i \\right)`}$ term to $\\dot{\\rho}$`,
    },
    {
        maxDifficulty: 3,
        name: () => `Conjecture 4`,
        goal: (difficulty) => {
            if (difficulty === 1) return BigNumber.from(250000);
            if (difficulty === 2) return BigNumber.from(750000);
            if (difficulty === 3) return BigNumber.from(2250000);
        },
        penalty: (difficulty) => {
            if (difficulty === 1) {
                return `$q_4$ is disabled. Softcap is stronger.`;
            } else if (difficulty === 2) {
                return `$q_4$, $q_3$ are disabled. Softcap is stronger.`;
            } else {
                return `$q_4$, $q_3$, $q_2$ are disabled. Softcap is stronger.`;
            }
        },
        reward: (difficulty) => `Softcap is +$${conjectures[3].getRewardStr(difficulty)}$`,

        onStart: (difficulty) => {
            if (difficulty >= 1) { dq4.maxLevel = 0; }
            if (difficulty >= 2) { dq3.maxLevel = 0; }
            if (difficulty >= 3) { q2 = BigNumber.ONE; dq2.maxLevel = 0; }
        },
        onEnd: (difficulty) => {
            dq4.maxLevel = 2147483647;
            dq3.maxLevel = 2147483647;
            dq2.maxLevel = 2147483647;
        },
        
        getReward(difficulty) {
            return BigNumber.from(0.01 * difficulty);
        },
        getRewardStr(difficulty) {
            return `${this.getReward(difficulty)}`;
        },
    },
];
var enterConjecture = (id, difficulty) => {
    if (conjectureActiveData.id !== -1 && conjectures[conjectureActiveData.id].onEnd) {
        conjectures[conjectureActiveData.id].onEnd(conjectureActiveData.difficulty);
    }

    onGammaAdjustmentReset(true);
    conjectureActiveData.id = id;
    conjectureActiveData.difficulty = difficulty;

    if (conjectures[conjectureActiveData.id].onStart) {
        conjectures[conjectureActiveData.id].onStart(conjectureActiveData.difficulty);
    }
};
var exitConjecture = () => {
    if (conjectureActiveData.id !== -1 && conjectures[conjectureActiveData.id].onEnd) {
        conjectures[conjectureActiveData.id].onEnd(conjectureActiveData.difficulty);
    }
    
    conjectureActiveData.id = -1;
    conjectureActiveData.difficulty = -1;
};

// Auto-buyer variables
var autobuyerUnlock, autobuyEnabled;
var autobuyerUnlockDQ1, autobuyerDQ1Rate, autobuyerDQ1Bulk;
var autobuyerUnlockDQ2, autobuyerDQ2Rate, autobuyerDQ2Bulk;
var autobuyerUnlockDQ3, autobuyerDQ3Rate, autobuyerDQ3Bulk;
var autobuyerConfigurationUpgradeMapper = { };
var autobuyerConfiguration = {
    ["q1"]: { autobuyTimer: 999, },
    ["q2"]: { autobuyTimer: 999, },
    ["q3"]: { autobuyTimer: 999, },
    ["q4"]: { autobuyTimer: 999, },
};
var autobuyerConfigurationCooldown = {
    ["q1"]: () => [2 - 0.1 * autobuyerDQ1Rate.level, autobuyerDQ1Bulk.level + 1],
    ["q2"]: () => [2 - 0.1 * autobuyerDQ2Rate.level, autobuyerDQ2Bulk.level + 1],
    ["q3"]: () => [2 - 0.1 * autobuyerDQ3Rate.level, autobuyerDQ3Bulk.level + 1],
    ["q4"]: () => [2, 1],
};

var numberFormat = (value, decimals, negExpFlag=false) => {
    if (value >= BigNumber.ZERO)
    {
        if (value >= BigNumber.from(0.1) || value == BigNumber.ZERO) 
        {
            if (value > BigNumber.ZERO && value < BigNumber.ONE && decimals < 3)
            {
                return value.toString(3);
            }
            return value.toString(decimals);
        }
        else
        {
            let exp = Math.floor((value*BigNumber.from(1+1e-5)).log10().toNumber());
            let mts = (value * BigNumber.TEN.pow(-exp)).toString(decimals);
            if (mts.startsWith('10')) { // Edge case when mantissa rounds up to 10
                mts = (value * BigNumber.TEN.pow(-exp) / 10).toString(decimals)
                exp++;
            }
            if (exp > 0 || !negExpFlag)
            {
                return `${mts}e${exp}`;
            }
            else
            {
                return `${mts}e$\\,-$${-exp}`;
            }
        }
    }
    else
    {
        value = -value;
        if (value >= BigNumber.from(0.1) || value == BigNumber.ZERO) 
        {
            return (-value).toString(decimals);
        }
        else
        {
            let exp = Math.floor((value*BigNumber.from(1+1e-5)).log10().toNumber());
            let mts = (value * BigNumber.TEN.pow(-exp)).toString(decimals);
            return `-${mts}e${exp}`;
        }
    }
};

var init = () => {
    currency = theory.createCurrency(`ρ`, `\\rho`);
    gammaCurrency = theory.createCurrency(`γ`, `\\gamma`);

    {
        let getDesc = (level) => `\\dot{q}_1 = ${getDQ1(level).toString(level > 9 && gammaup_gammaDQ1Scaling.level > 0 ? 2 : 1)} \\times q_2`;
        let getInfo = (level) => `\\dot{q}_1 = ${(getDQ1(level) * q2).toString(4)}`;
        dq1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(0.1, Math.log2(2e2) / 2)));
        dq1.getDescription = (_) => Utils.getMath(getDesc(dq1.level));
        dq1.getInfo = (amount) => Utils.getMathTo(getInfo(dq1.level), getInfo(dq1.level + amount));
        autobuyerConfigurationUpgradeMapper["q1"] = dq1;
    }
    {
        let getDesc = (level) => {
            let result = `\\dot{q}_2 = ${getDQ2(level).toString(1)}`;
            if (gammaup_gammaDQ2Factor.level > 0) result += ` \\gamma_4`;
            return `${result} \\times q_3`;
        };
        let getInfo = (level) => `\\dot{q}_2 = ${(getDQ2(level) * getGammaUpgGammaDQ2Factor() * q3).toString(4)}`;
        dq2 = theory.createUpgrade(1, currency, new FirstFreeCost(new ExponentialCost(1, Math.log2(2e4) / 2)));
        dq2.getDescription = (_) => Utils.getMath(getDesc(dq2.level));
        dq2.getInfo = (amount) => Utils.getMathTo(getInfo(dq2.level), getInfo(dq2.level + amount));
        autobuyerConfigurationUpgradeMapper["q2"] = dq2;
    }
    {
        let getDesc = (level) => `\\dot{q}_3 = ${getDQ3(level).toString(1)} \\times q_4`;
        let getInfo = (level) => `\\dot{q}_3 = ${(getDQ3(level) * q4).toString(4)}`;
        dq3 = theory.createUpgrade(2, currency, new ExponentialCost(10000, Math.log2(2e6) / 2));
        dq3.getDescription = (_) => Utils.getMath(getDesc(dq3.level));
        dq3.getInfo = (amount) => Utils.getMathTo(getInfo(dq3.level), getInfo(dq3.level + amount));
        autobuyerConfigurationUpgradeMapper["q3"] = dq3;
    }
    {
        let getDesc = (level) => `\\dot{q}_4 = ${getDQ4(level).toString(1)}`;
        let getInfo = (level) => `\\dot{q}_4 = ${getDQ4(level).toString(4)}`;
        dq4 = theory.createUpgrade(3, currency, new ExponentialCost(8e18, Math.log2(2e8) / 2));
        dq4.getDescription = (_) => Utils.getMath(getDesc(dq4.level));
        dq4.getInfo = (amount) => Utils.getMathTo(getInfo(dq4.level), getInfo(dq4.level + amount));
        autobuyerConfigurationUpgradeMapper["q4"] = dq4;
    }
    {
        theory.createBuyAllUpgrade(0, currency, 10000);
    }
    {
        let getDesc = (level) => {
            let result = `n_t = ${level}`;
            if (gammaup_gammaTickspeed.level > 0) result += ` + \\gamma_3`;
            return result;
        };
        let getInfo = (level) => `n_t = ${getTn(level)}`;
        tickspeed = theory.createPermanentUpgrade(3, currency, new ExponentialCost(2, Math.log2(80)));
        tickspeed.getDescription = (_) => Utils.getMath(getDesc(tickspeed.level));
        tickspeed.getInfo = (amount) => Utils.getMathTo(getInfo(tickspeed.level), getInfo(tickspeed.level + amount));
        tickspeed.maxLevel = 4;
    }
    
    {
        let getDesc = (level) => {
            let base = `\\gamma_1 = 1.8^{${level}}`;
            if (level === 0) base = `\\text{Add } \\gamma_1 \\text{ factor to } \\dot{\\rho} \\\\ ${base}`;
            return base;
        };
        let getInfo = (level) => {
            let base = `\\gamma_1 = ${getGammaUpgGammaMult(level)}`;
            if (level === 0) base = `\\text{Add } \\gamma_1 \\text{ factor to } \\dot{\\rho} \\\\ ${base}`;
            return base;
        };
        gammaup_gammaMult = theory.createUpgrade(10, gammaCurrency, new ExponentialCost(1, Math.log2(1.85)));
        gammaup_gammaMult.getDescription = (_) => Utils.getMath(getDesc(gammaup_gammaMult.level));
        gammaup_gammaMult.getInfo = (amount) => Utils.getMathTo(getInfo(gammaup_gammaMult.level), getInfo(gammaup_gammaMult.level + amount));
    }
    {
        let getDesc = (level) => {
            let base = `\\gamma_2 = 1 + ${getGammaUpgGammaTimeMult_StepwiseScaling(level).toString(0)} \\times t^{3} / 10^{6}`;
            if (level === 0) base = `\\text{Add } \\gamma_2 \\text{ factor to } \\dot{\\rho} \\\\ ${base}`;
            return base;
        };
        let getInfo = (level) => {
            let base = `\\gamma_2 = ${getGammaUpgGammaTimeMult(level)}`;
            if (level === 0) base = `\\text{Add } \\gamma_2 \\text{ factor to } \\dot{\\rho} \\\\ ${base}`;
            return base;
        };
        gammaup_gammaTimeMult = theory.createUpgrade(17, gammaCurrency, new ExponentialCost(1, Math.log2(1.7)));
        gammaup_gammaTimeMult.getDescription = (_) => Utils.getMath(getDesc(gammaup_gammaTimeMult.level));
        gammaup_gammaTimeMult.getInfo = (amount) => Utils.getMathTo(getInfo(gammaup_gammaTimeMult.level), getInfo(gammaup_gammaTimeMult.level + amount));
    }
    {
        let getDesc = (level) => {
            let base = `\\gamma_3 = ${level}`;
            if (level === 0) base = `\\text{Add } \\gamma_3 \\text{ term to } n_t \\\\ ${base}`;
            return base;
        };
        let getInfo = (level) => {
            let base = `\\gamma_3 = ${level}`;
            if (level === 0) base = `\\text{Add } \\gamma_3 \\text{ term to } n_t \\\\ ${base}`;
            return base;
        };
        gammaup_gammaTickspeed = theory.createUpgrade(19, gammaCurrency, new ExponentialCost(3, Math.log2(14.5)));
        gammaup_gammaTickspeed.getDescription = (_) => Utils.getMath(getDesc(gammaup_gammaTickspeed.level));
        gammaup_gammaTickspeed.getInfo = (amount) => Utils.getMathTo(getInfo(gammaup_gammaTickspeed.level), getInfo(gammaup_gammaTickspeed.level + amount));
        gammaup_gammaTickspeed.maxLevel = tickspeedConsts.length - tickspeed.maxLevel - 1;
    }
    {
        let getDesc = (level) => {
            let base = `\\gamma_4 = 1.1^{${level}}`;
            if (level === 0) base = `\\text{Add } \\gamma_4 \\text{ factor to } \\dot{q_2} \\\\ ${base}`;
            return base;
        };
        let getInfo = (level) => {
            let base = `\\gamma_4 = ${getGammaUpgGammaDQ2Factor(level)}`;
            if (level === 0) base = `\\text{Add } \\gamma_4 \\text{ factor to } \\dot{q_2} \\\\ ${base}`;
            return base;
        };
        gammaup_gammaDQ2Factor = theory.createUpgrade(20, gammaCurrency, new ExponentialCost(70, Math.log2(5)));
        gammaup_gammaDQ2Factor.getDescription = (_) => Utils.getMath(getDesc(gammaup_gammaDQ2Factor.level));
        gammaup_gammaDQ2Factor.getInfo = (amount) => Utils.getMathTo(getInfo(gammaup_gammaDQ2Factor.level), getInfo(gammaup_gammaDQ2Factor.level + amount));
        gammaup_gammaDQ2Factor.maxLevel = 3;
    }
    {
        let getDesc = (level) => {
            let base = `\\gamma_5 = 2 \\times ${level}`;
            if (level === 0) base = `\\text{Add } \\gamma_5 \\text{ term to all } \\dot{q} \\text{ decay} ; \\text{ } ${base}`;
            return base;
        };
        let getInfo = (level) = (level) => {
            let base = `\\gamma_5 = ${getGammaUpgGammaQDecay(level)}`;
            if (level === 0) base = `\\text{Add } \\gamma_5 \\text{ term to all } \\dot{q} \\text{ decay} ; \\text{ } ${base}`;
            return base;
        };
        gammaup_gammaQDecay = theory.createUpgrade(22, gammaCurrency, new ExponentialCost(100, Math.log2(2.5)));
        gammaup_gammaQDecay.getDescription = (_) => Utils.getMath(getDesc(gammaup_gammaQDecay.level));
        gammaup_gammaQDecay.getInfo = (amount) => Utils.getMathTo(getInfo(gammaup_gammaQDecay.level), getInfo(gammaup_gammaQDecay.level + amount));
        gammaup_gammaQDecay.maxLevel = 5;
    }
    {
        let getDesc = (level) => `\\gamma_6 = 0.04 \\times ${level}`;
        let getInfo = (level) => `\\gamma_6 = ${getGammaUpgGammaGainExp(level)}`;
        gammaup_gammaGainExp = theory.createUpgrade(18, gammaCurrency, new ExponentialCost(10, Math.log2(3)));
        gammaup_gammaGainExp.getDescription = (_) => Utils.getMath(getDesc(gammaup_gammaGainExp.level));
        gammaup_gammaGainExp.getInfo = (amount) => Utils.getMathTo(getInfo(gammaup_gammaGainExp.level), getInfo(gammaup_gammaGainExp.level + amount));
        gammaup_gammaGainExp.maxLevel = 6;
    }
    {
        let getDesc = (level) => {
            let base = `\\gamma_7 = 0.1 \\times ${level}`;
            if (level === 0) base = `\\text{Add } \\gamma_7 \\text{ term to } \\dot{q_1} \\text{ doubling base} \\\\ ${base}`;
            return base;
        };
        let getInfo = (level) => {
            let base = `\\gamma_7 = ${BigNumber.from(getGammaUpgGammaDQ1Scaling(level))}`;
            if (level === 0) base = `\\text{Add } \\gamma_7 \\text{ term to } \\dot{q_1} \\text{ doubling base} \\\\ ${base}`;
            return base;
        };
        gammaup_gammaDQ1Scaling = theory.createUpgrade(21, gammaCurrency, new ExponentialCost(10000, Math.log2(2.1)));
        gammaup_gammaDQ1Scaling.getDescription = (_) => Utils.getMath(getDesc(gammaup_gammaDQ1Scaling.level));
        gammaup_gammaDQ1Scaling.getInfo = (amount) => Utils.getMathTo(getInfo(gammaup_gammaDQ1Scaling.level), getInfo(gammaup_gammaDQ1Scaling.level + amount));
        gammaup_gammaDQ1Scaling.maxLevel = 3;
    }

    {
        autobuyerUnlock = theory.createUpgrade(11, currency, new ConstantCost(1e6));
        autobuyerUnlock.description = Localization.getUpgradeAutoBuyerDesc();
        autobuyerUnlock.info = `Allows to automatically purchase theory upgrades`;
        autobuyerUnlock.maxLevel = 1;
        autobuyerUnlock.bought = (_) => updateAvailability();

        autobuyEnabled = theory.createUpgrade(12, gammaCurrency, new FreeCost());
        autobuyEnabled.getDescription = (_) => autobuyEnabled.level < 1 ? `Disable auto-buyer` : `Enable auto-buyer`;
        autobuyEnabled.info = `Toggles the auto-buyer`;
        autobuyEnabled.bought = (_) => {
            autobuyEnabled.level &= 1;
        };
    }
    {
        autobuyerUnlockDQ1 = theory.createUpgrade(13, gammaCurrency, new ConstantCost(20));
        autobuyerUnlockDQ1.description = `Unlock $\\dot{q_1}$ auto-buyer`;
        autobuyerUnlockDQ1.info = `Allows to automatically purchase $\\dot{q_1}$`;
        autobuyerUnlockDQ1.maxLevel = 1;
        autobuyerUnlockDQ1.bought = (_) => {
            autobuyerConfiguration.q1.enabled = true;
            updateAvailability();
        };
        
        let getRateDesc = (level) => `\\dot{q_1} \\text{ Automation/s} = 2 - 0.1 \\times ${level}`;
        let getRateInfo = (level) => `\\dot{q_1} \\text{ Automation/s} = ${BigNumber.from(2 - 0.1 * level)}`;
        autobuyerDQ1Rate = theory.createUpgrade(14, gammaCurrency, new ExponentialCost(20, 1.42));
        autobuyerDQ1Rate.getDescription = (_) => Utils.getMath(getRateDesc(autobuyerDQ1Rate.level));
        autobuyerDQ1Rate.getInfo = (amount) => Utils.getMathTo(getRateInfo(autobuyerDQ1Rate.level), getRateInfo(autobuyerDQ1Rate.level + amount));
        autobuyerDQ1Rate.maxLevel = 19;
        
        let getBulkDesc = (level) => `\\dot{q_1} \\text{ Buy/Automation} = ${level + 1}`;
        let getBulkInfo = (level) => `\\dot{q_1} \\text{ Buy/Automation} = ${level + 1}`;
        autobuyerDQ1Bulk = theory.createUpgrade(26, gammaCurrency, new ExponentialCost(25, 2));
        autobuyerDQ1Bulk.getDescription = (_) => Utils.getMath(getBulkDesc(autobuyerDQ1Bulk.level));
        autobuyerDQ1Bulk.getInfo = (amount) => Utils.getMathTo(getBulkInfo(autobuyerDQ1Bulk.level), getBulkInfo(autobuyerDQ1Bulk.level + amount));
    }
    {
        autobuyerUnlockDQ2 = theory.createUpgrade(15, gammaCurrency, new ConstantCost(30));
        autobuyerUnlockDQ2.description = `Unlock $\\dot{q_2}$ auto-buyer`;
        autobuyerUnlockDQ2.info = `Allows to automatically purchase $\\dot{q_2}$`;
        autobuyerUnlockDQ2.maxLevel = 1;
        autobuyerUnlockDQ2.bought = (_) => {
            autobuyerConfiguration.q2.enabled = true;
            updateAvailability();
        };
        
        let getRateDesc = (level) => `\\dot{q_2} \\text{ Automation/s} = 2 - 0.1 \\times ${level}`;
        let getRateInfo = (level) => `\\dot{q_2} \\text{ Automation/s} = ${BigNumber.from(2 - 0.1 * level)}`;
        autobuyerDQ2Rate = theory.createUpgrade(16, gammaCurrency, new ExponentialCost(30, 1.41));
        autobuyerDQ2Rate.getDescription = (_) => Utils.getMath(getRateDesc(autobuyerDQ2Rate.level));
        autobuyerDQ2Rate.getInfo = (amount) => Utils.getMathTo(getRateInfo(autobuyerDQ2Rate.level), getRateInfo(autobuyerDQ2Rate.level + amount));
        autobuyerDQ2Rate.maxLevel = 19;
        
        let getBulkDesc = (level) => `\\dot{q_2} \\text{ Buy/Automation} = ${level + 1}`;
        let getBulkInfo = (level) => `\\dot{q_2} \\text{ Buy/Automation} = ${level + 1}`;
        autobuyerDQ2Bulk = theory.createUpgrade(27, gammaCurrency, new ExponentialCost(37.5, 2.5));
        autobuyerDQ2Bulk.getDescription = (_) => Utils.getMath(getBulkDesc(autobuyerDQ2Bulk.level));
        autobuyerDQ2Bulk.getInfo = (amount) => Utils.getMathTo(getBulkInfo(autobuyerDQ2Bulk.level), getBulkInfo(autobuyerDQ2Bulk.level + amount));
    }
    {
        autobuyerUnlockDQ3 = theory.createUpgrade(23, gammaCurrency, new ConstantCost(2000));
        autobuyerUnlockDQ3.description = `Unlock $\\dot{q_3}$ auto-buyer`;
        autobuyerUnlockDQ3.info = `Allows to automatically purchase $\\dot{q_3}$`;
        autobuyerUnlockDQ3.maxLevel = 1;
        autobuyerUnlockDQ3.bought = (_) => {
            autobuyerConfiguration.q3.enabled = true;
            updateAvailability();
        };
        
        let getRateDesc = (level) => `\\dot{q_3} \\text{ Automation/s} = 2 - 0.1 \\times ${level}`;
        let getRateInfo = (level) => `\\dot{q_3} \\text{ Automation/s} = ${BigNumber.from(2 - 0.1 * level)}`;
        autobuyerDQ3Rate = theory.createUpgrade(24, gammaCurrency, new ExponentialCost(800, 1.18));
        autobuyerDQ3Rate.getDescription = (_) => Utils.getMath(getRateDesc(autobuyerDQ3Rate.level));
        autobuyerDQ3Rate.getInfo = (amount) => Utils.getMathTo(getRateInfo(autobuyerDQ3Rate.level), getRateInfo(autobuyerDQ3Rate.level + amount));
        autobuyerDQ3Rate.maxLevel = 19;
        
        let getBulkDesc = (level) => `\\dot{q_3} \\text{ Buy/Automation} = ${level + 1}`;
        let getBulkInfo = (level) => `\\dot{q_3} \\text{ Buy/Automation} = ${level + 1}`;
        autobuyerDQ3Bulk = theory.createUpgrade(25, gammaCurrency, new ExponentialCost(1000, 3));
        autobuyerDQ3Bulk.getDescription = (_) => Utils.getMath(getBulkDesc(autobuyerDQ3Bulk.level));
        autobuyerDQ3Bulk.getInfo = (amount) => Utils.getMathTo(getBulkInfo(autobuyerDQ3Bulk.level), getBulkInfo(autobuyerDQ3Bulk.level + amount));
    }

    let achievement_category1 = theory.createAchievementCategory(0, "Progression");
    {
        achievement1 = theory.createAchievement(0, achievement_category1, "Achievements are the way to go", `Reach 1ρ, 1 q₁, or 1 q₂.\n\nReward: all production above 1 is powered by 0.8.`, () => currency.value >= 1 || q1 >= 1 || q2 >= 1);
        achievement2 = theory.createAchievement(1, achievement_category1, "No progress", `Let q₃ and q₄ fall below 0.001.\n\nReward: initial q₃ value is multiplied by 1.2.`, () => q3 < 0.001 && q4 < 0.001);
        achievement3 = theory.createAchievement(2, achievement_category1, "Decay was too strong", `Perform a gamma reset.\n\nReward: multiply γ gain by 2.`, () => gammaResets > 0);
        achievement5 = theory.createAchievement(4, achievement_category1, "Full house", `Max out γ₄, γ₅, and γ₆.\n\nReward: unlock γ₇.`, () => gammaup_gammaDQ2Factor.level === gammaup_gammaDQ2Factor.maxLevel && gammaup_gammaQDecay.level === gammaup_gammaQDecay.maxLevel && gammaup_gammaGainExp.level === gammaup_gammaGainExp.maxLevel);
        achievement6 = theory.createAchievement(5, achievement_category1, "Scaling!", `Max out γ₇.\n\nReward: unlock Conjectures.`, () => gammaup_gammaDQ1Scaling.level === gammaup_gammaDQ1Scaling.maxLevel);
        achievement4 = theory.createAchievement(3, achievement_category1, "Big q family", `Let q₁, q₂, q₃ and q₄ all be above 1.`, () => q1 > 1 && q2 > 1 && q3 > 1 && q4 > 1);
    }

    {
        theory.createStoryChapter(0, "A Reminder from the Past", `You were, as they'd say, "chilling" at your very own house. You don't need to worry about anything at this point. The amount of money you got from that little equation from your golden days was enough to sustain you for the rest of your days.

One day, a group of students that you once graduated decided to have a party specifically for you. You shared some stories, some laughs, food, and drinks.

One student asked: "How did you come up with the now-famous equation? And why did you stop at that?" The one that made me filthy rich and brought together so many students in one place. You told them how and as you do that, you reminisced. Despite it being effectively a job that made you a lot of money, you enjoyed it.
Yet, even you couldn't quite tell why you stopped there. Your students were flourishing, and they even had their own students... why couldn't you still do the same?

"Weierstrass Sine Product" by ███████, "Sequential Limits" by ████████, "Euler's Formula" by ██████, ████, and ██████, and "Convergents to √2" by ████████. Those were the projects your students had a hand in. Those were the projects they had researched to their limits.

You may have retired, but that doesn't mean you can't dedicate a bit of yourself to something you enjoy just as much as you did with that equation, just as much as they did with their projects. It can be a hobby that you do on a lonely evening.

You had decided to be ambitious and look into the "Theory of Everything" as your first candidate.`, () => true);

        theory.createStoryChapter(1, "Underestimation", `You've underestimated this theory. Maybe it wasn't the greatest pick as you thought initially.
Still, though, everything has been merely a refresher for your mind so far.

You acknowledge that at this rate you'll soon start making no progress.
You must adjust more constants for this to work out.`, () => maxRho >= 1000);
        
        theory.createStoryChapter(2, "A Burst", `After adjusting the constants enough, you begin to see something.
As you recheck all your calculations, you're shocked by what you see.

A pattern.

How could you not see it before? It was staring at you all this time.
It seems like you'll be able to advance this theory after all.`, () => achievement6.isUnlocked);
    }

    updateAvailability();
};

var updateAvailability = () => {
    autobuyerUnlock.isAvailable = stage === -1 && autobuyerUnlock.level < 1;
    autobuyEnabled.isAvailable = stage === -1 && autobuyerUnlock.level > 0;
    autobuyerUnlockDQ1.isAvailable = autobuyEnabled.isAvailable && autobuyerUnlockDQ1.level < 1;
    autobuyerDQ1Rate.isAvailable = autobuyerDQ1Bulk.isAvailable = autobuyEnabled.isAvailable && autobuyerUnlockDQ1.level > 0;
    autobuyerUnlockDQ2.isAvailable = autobuyEnabled.isAvailable && autobuyerUnlockDQ2.level < 1;
    autobuyerDQ2Rate.isAvailable = autobuyerDQ2Bulk.isAvailable = autobuyEnabled.isAvailable && autobuyerUnlockDQ2.level > 0;
    autobuyerUnlockDQ3.isAvailable = autobuyEnabled.isAvailable && autobuyerUnlockDQ3.level < 1;
    autobuyerDQ3Rate.isAvailable = autobuyerDQ3Bulk.isAvailable = autobuyEnabled.isAvailable && autobuyerUnlockDQ3.level > 0;

    dq1.isAvailable = stage === 0;
    dq2.isAvailable = stage === 0;
    dq3.isAvailable = stage === 0;
    dq4.isAvailable = stage === 0;

    gammaup_gammaMult.isAvailable = stage === 1;
    gammaup_gammaTimeMult.isAvailable = stage === 1;
    gammaup_gammaTickspeed.isAvailable = stage === 1;
    gammaup_gammaDQ2Factor.isAvailable = stage === 1;
    gammaup_gammaQDecay.isAvailable = stage === 1;
    gammaup_gammaGainExp.isAvailable = stage === 1;
    gammaup_gammaDQ1Scaling.isAvailable = achievement5.isUnlocked && stage === 1;
    gammaupsing_conjectures = achievement6.isUnlocked && stage === 1;
};

var getInternalState = () => JSON.stringify({
    t: t.toBase64String(),
    maxRho: maxRho.toBase64String(),
    q1: q1.toBase64String(),
    q2: q2.toBase64String(),
    q3: q3.toBase64String(),
    q4: q4.toBase64String(),
    gammaResets,
    gammaCurrencyTotal: gammaCurrencyTotal.toBase64String(),
    conjectureActiveData,
    conjecturesHighestCompletedDifficulties,
    autobuyerConfiguration: autobuyerConfiguration,
});

var setInternalState = (stateStr) => {
    if (!stateStr) return;
    
    let state = JSON.parse(stateStr);
    if (state.t) t = BigNumber.fromBase64String(state.t);
    maxRho = BigNumber.fromBase64String(state.maxRho);
    q1 = BigNumber.fromBase64String(state.q1);
    q2 = BigNumber.fromBase64String(state.q2);
    q3 = BigNumber.fromBase64String(state.q3);
    q4 = BigNumber.fromBase64String(state.q4);
    gammaResets = state.gammaResets;
    gammaCurrencyTotal = BigNumber.fromBase64String(state.gammaCurrencyTotal);
    if (state.conjectureActiveData) conjectureActiveData = state.conjectureActiveData;
    if (state.conjecturesHighestCompletedDifficulties) conjecturesHighestCompletedDifficulties = state.conjecturesHighestCompletedDifficulties;
    autobuyerConfiguration = state.autobuyerConfiguration;
};

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier) * getTickspeed();
    let bonus = theory.publicationMultiplier;

    localDeltaTime = dt;

    visual_dq1 = visual_dq2 = visual_dq3 = visual_dq4 = BigNumber.ZERO;
    visual_drho = BigNumber.ZERO;
    if (dq1.level > 0) {
        let q_decay = getQDecay();

        // The decay term should be outside softcap operation
        /*let q_scale = BigNumber.ONE - BigNumber.E.pow(-dt / q_decay);
        if (q_scale < 1e-13) q_scale = dt / q_decay;

        let baseDQ4 = getDQ4();
        let q4_dq4 = calculateXDxSoftcapped(q4, q_scale * (baseDQ4 * q_decay - q4));
        q4 = q4_dq4[0].max(BigNumber.ZERO); visual_dq4 = q4_dq4[1] / dt;

        let baseDQ3 = getDQ3() * q4;
        let q3_dq3 = calculateXDxSoftcapped(q3, q_scale * (baseDQ3 * q_decay - q3));
        q3 = q3_dq3[0].max(BigNumber.ZERO); visual_dq3 = q3_dq3[1] / dt;

        let baseDQ2 = getDQ2() * getGammaUpgGammaDQ2Factor() * q3;
        let q2_dq2 = calculateXDxSoftcapped(q2, q_scale * (baseDQ2 * q_decay - q2));
        q2 = q2_dq2[0].max(BigNumber.ZERO); visual_dq2 = q2_dq2[1] / dt;

        let baseDQ1 = getDQ1() * q2;
        let q1_dq1 = calculateXDxSoftcapped(q1, q_scale * (baseDQ1 * q_decay - q1));
        q1 = q1_dq1[0].max(BigNumber.ZERO); visual_dq1 = q1_dq1[1] / dt;*/

        let old_q1 = q1, old_q2 = q2, old_q3 = q3, old_q4 = q4;
        let dq1 = getDQ1() * q2;
        let dq2 = getDQ2() * getGammaUpgGammaDQ2Factor() * q3;
        let dq3 = getDQ3() * q4;
        let dq4 = getDQ4();

        let q1_dq1 = calculateXDxSoftcapped(q1, dq1 * dt);
        let q2_dq2 = calculateXDxSoftcapped(q2, dq2 * dt);
        let q3_dq3 = calculateXDxSoftcapped(q3, dq3 * dt);
        let q4_dq4 = calculateXDxSoftcapped(q4, dq4 * dt);
        q1 = (q1_dq1[0] - q1 / q_decay * dt).max(BigNumber.ZERO);
        q2 = (q2_dq2[0] - q2 / q_decay * dt).max(BigNumber.ZERO);
        q3 = (q3_dq3[0] - q3 / q_decay * dt).max(BigNumber.ZERO);
        q4 = (q4_dq4[0] - q4 / q_decay * dt).max(BigNumber.ZERO);
        visual_dq1 = (q1 - old_q1) / dt;
        visual_dq2 = (q2 - old_q2) / dt;
        visual_dq3 = (q3 - old_q3) / dt;
        visual_dq4 = (q4 - old_q4) / dt;

        let old_rho = currency.value;
        let drho = getGammaUpgGammaMult() * getGammaUpgGammaTimeMult();
        if (conjectureActiveData.id === 2) {
            if (conjectureActiveData.difficulty === 1) drho *= q2;
            if (conjectureActiveData.difficulty === 2) drho *= q3;
            if (conjectureActiveData.difficulty === 3) drho *= q4;
        } else {
            drho *= q1;
            if (conjecturesHighestCompletedDifficulties[2] > 0) drho *= q2.max(BigNumber.ONE);
            if (conjecturesHighestCompletedDifficulties[2] > 1) drho *= q3.max(BigNumber.ONE);
            if (conjecturesHighestCompletedDifficulties[2] > 2) drho *= q4.max(BigNumber.ONE);
        }

        let rho_drho = calculateXDxSoftcapped(currency.value, drho * dt);
        currency.value = rho_drho[0]; drho = rho_drho[1];
        visual_drho = (currency.value - old_rho) / dt;
        if (currency.value > maxRho) {
            maxRho = currency.value;
        }

        t += dt;
    }

    autobuyEnabled.isAutoBuyable = false;
    if (autobuyEnabled.level < 1) {
        const autobuyDt = elapsedTime;

        Object.keys(autobuyerConfiguration).forEach(key => {
            const value = autobuyerConfiguration[key];
            if (!value.enabled) return;

            const cooldown_bulk = autobuyerConfigurationCooldown[key]();
            value.autobuyTimer = Math.min(value.autobuyTimer - autobuyDt, cooldown_bulk[0]);
            if (value.autobuyTimer <= 0) {
                const upgrade = autobuyerConfigurationUpgradeMapper[key];
                const prev_available = upgrade.isAvailable;
                upgrade.isAvailable = true;
                if (upgrade.isAutoBuyable) {
                    upgrade.buy(Math.min(cooldown_bulk[1], upgrade.cost.getMax(upgrade.level, upgrade.currency.value)));
                }
                upgrade.isAvailable = prev_available;
                value.autobuyTimer = cooldown_bulk[0];
            }
        });
    }

    if (conjectureActiveData.id !== -1 && currency.value >= conjectures[conjectureActiveData.id].goal(conjectureActiveData.difficulty)) {
        conjecturesHighestCompletedDifficulties[conjectureActiveData.id] = conjectureActiveData.difficulty;
        exitConjecture();
    }

    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();
};

var onGammaAdjustmentReset = (soft) => {
    const dgamma = getGammaPending();
    if (dgamma > 0) {
        gammaCurrency.value += dgamma;
        gammaCurrencyTotal += dgamma;
    }
    if (!soft) {
        gammaResets++;
    }

    currency.value = BigNumber.ZERO;
    dq1.level = dq2.level = dq3.level = dq4.level = 0;
    q1 = q2 = BigNumber.ZERO;
    q3 = q4 = BigNumber.ONE;

    if (achievement2.isUnlocked) {
        q3 *= 1.2;
    }
    if (conjecturesHighestCompletedDifficulties[1] > 0) {
        const multi = conjectures[1].getReward(conjecturesHighestCompletedDifficulties[1]);
        q3 *= multi;
        q4 *= multi;
    }

    autobuyerConfiguration.q1.autobuyTimer = autobuyerConfigurationCooldown.q1()[0];
    autobuyerConfiguration.q2.autobuyTimer = autobuyerConfigurationCooldown.q2()[0];
    autobuyerConfiguration.q3.autobuyTimer = autobuyerConfigurationCooldown.q3()[0];
    autobuyerConfiguration.q4.autobuyTimer = autobuyerConfigurationCooldown.q4()[0];

    t = BigNumber.ZERO;
    maxRho = BigNumber.ZERO;
    theory.clearGraph();

    if (conjectureActiveData.id !== -1 && conjectures[conjectureActiveData.id].onEnd) {
        conjectures[conjectureActiveData.id].onEnd(conjectureActiveData.difficulty);
    }
    conjectureActiveData.id = -1;
    conjectureActiveData.difficulty = -1;
};

var postPublish = () => {
};

var canResetStage = () => gammaResets < 1 && maxRho < 1000 || conjectureActiveData.id > -1;
var getResetStageMessage = () => `You can perform a reset when your ${currency.symbol} is stuck.`;
var resetStage = () => {
    if (conjectureActiveData.id > -1) {
        enterConjecture(conjectureActiveData.id, conjectureActiveData.difficulty);
    } else {
        onGammaAdjustmentReset(true);
    }
};

//
// UI
//

let getImageSize = (width) => {
    if (width >= 1080) return 48;
    if (width >= 720) return 36;
    if (width >= 360) return 24;
    return 20;
}

let createImageBtn = (params, callback, isAvailable, image) => {
    let triggerable = true;
    let borderColor = () => isAvailable() ? Color.BORDER : Color.TRANSPARENT;
    let frame = ui.createFrame({
        cornerRadius: 1,
        margin: new Thickness(2),
        padding: new Thickness(2),
        hasShadow: isAvailable,
        heightRequest: getImageSize(ui.screenWidth),
        widthRequest: getImageSize(ui.screenWidth),
        content: ui.createImage({
            source: image,
            aspect: Aspect.ASPECT_FIT,
            useTint: false
        }),
        borderColor,
        ...params
    });
    frame.onTouched = (e) => {
        if (e.type == TouchType.PRESSED) {
            frame.borderColor = Color.TRANSPARENT;
        }
        else if (e.type.isReleased()) {
            frame.borderColor = borderColor;
            if (triggerable && isAvailable()) {
                Sound.playClick();
                callback();
            }
            else {
                triggerable = true;
            }
        }
        else if (e.type == TouchType.MOVED && (e.x < 0 || e.y < 0 || e.x > frame.width || e.y > frame.height)) {
            frame.borderColor = borderColor;
            triggerable = false;
        }
    };
    return frame;
};

const gammaResetImage = game.settings.theme == Theme.LIGHT
    ? ImageSource.fromUri('https://raw.githubusercontent.com/BasicallyIAmFox/exponential-idle-cts/refs/heads/main/theory-of-everything/GammaResetLight.png')
    : ImageSource.fromUri('https://raw.githubusercontent.com/BasicallyIAmFox/exponential-idle-cts/refs/heads/main/theory-of-everything/GammaResetDark.png');
const gammaResetMenuFrame = createImageBtn({
    row: 0, column: 0,
    horizontalOptions: LayoutOptions.START,
    verticalOptions: LayoutOptions.START,
    isVisible: () => gammaResets > 0 || maxRho >= 1000,
}, () => createGammaResetMenu().show(), () => true, gammaResetImage);

var getPrimaryEquation = () => {
    let result = `\\begin{array}{}`;

    if (stage === -1) {
        result += `\\dot{\\rho} = ${visual_drho.toString(2)}`;
    }
    else if (stage === 0) {
        let rhodot = ``;
        if (gammaup_gammaMult.level > 0) rhodot += `\\gamma_1 `;
        if (gammaup_gammaTimeMult.level > 0) rhodot += `\\gamma_2 `;
        if (conjectureActiveData.id === 2) {
            rhodot += `q_${conjectureActiveData.difficulty + 1}`;
        } else {
            rhodot += `q_1`;
            if (conjecturesHighestCompletedDifficulties[2] > 0)
                rhodot += `\\prod_{i = 2}^{${conjecturesHighestCompletedDifficulties[2] + 1}} \\max \\left( 1, q_i \\right)`;
        }
        result += `\\dot{\\rho} = ${rhodot}`;
    }
    else if (stage === 1) {
        let base = `\\left( \\frac{\\bar{\\rho}}{${getGammaGainRhoThresholdLatex()}} \\right)^{${getGammaGainScalingLatex()}}`;
        if (achievement3.isUnlocked) {
            base = `2 ${base}`;
        }
        result += `d \\gamma = ${base}`;
    }

    result += `\\end{array}`
    return result;
};

var getSecondaryEquation = () => {
    let result = `\\begin{array}{}`;

    if (stage === -1) {
        theory.secondaryEquationHeight = 20;
        theory.secondaryEquationScale = 1;

        result += `\\dot{t} = (11 - n_t) / 2^{10 - n_t} \\\\`;
        result += `n_t = ${tickspeed.level}`;
        if (gammaup_gammaTickspeed.level > 0) result += ` + \\gamma_3`;
        result += `\\\\`;
        result += `\\\\ \\text{Tickspeed = } 10 \\dot{t}`;
    }
    else if (stage === 0) {
        theory.secondaryEquationHeight = 50;
        theory.secondaryEquationScale = 1;

        if (achievement1.isUnlocked) {
            let softcap = BigNumber.from(0.8 + conjectures[3].getReward(conjecturesHighestCompletedDifficulties[3]));
            if (conjectureActiveData.id === 3) softcap /= 2;

            result += `(\\forall x) \\left( x > 1 \\Rightarrow \\dot{x} = \\left( x^{${1 / softcap}} + \\dot{x} \\right)^{${softcap}} - x \\right) \\\\`;
        }

        let qDecayStr = `\\frac{`;
        if (conjectureActiveData.id === 0) qDecayStr += `${conjectures[0].getPenaltyStr(conjectureActiveData.difficulty)} `;
        qDecayStr = `${qDecayStr} q}{${getQDecayLatex()}}`
        result += `\\left( \\forall q \\right) \\left( \\dot{q} = \\dot{q} - ${qDecayStr} \\right)`;
    }
    else if (stage === 1) {
        theory.secondaryEquationHeight = 20;
        theory.secondaryEquationScale = 1;

        result += `\\bar{\\rho} = \\max {\\rho}`;
    }

    result += `\\end{array}`
    return result;
};

var getTertiaryEquation = () => stringTickspeed((10 * getTickspeed()).toString(4));

var getQuaternaryEntries = () => {
    let entries = [];

    if (stage === -1) {
        entries.push(new QuaternaryEntry("\\dot{q_1}", visual_dq1.toString(4)));
        entries.push(new QuaternaryEntry("\\dot{q_2}", visual_dq2.toString(4)));
        entries.push(new QuaternaryEntry("\\dot{q_3}", visual_dq3.toString(4)));
        entries.push(new QuaternaryEntry("\\dot{q_4}", visual_dq4.toString(4)));
    }
    else if (stage === 0) {
        entries.push(new QuaternaryEntry("q_1", q1.toString(4)));
        entries.push(new QuaternaryEntry("q_2", q2.toString(4)));
        entries.push(new QuaternaryEntry("q_3", q3.toString(4)));
        entries.push(new QuaternaryEntry("q_4", q4.toString(4)));
    }
    else if (stage === 1) {
        entries.push(new QuaternaryEntry("t", t.toString(3)));
        entries.push(new QuaternaryEntry("d\\gamma", getGammaPending()));
        entries.push(new QuaternaryEntry("\\frac{d\\gamma}{t}", (getGammaPending() / t.max(0.1)).toString(3)));
        entries.push(new QuaternaryEntry("\\bar{\\rho}", maxRho));
    }

    return entries;
};

var getCurrencyBarDelegate = () => {
    let currencyBar = ui.createFrame({
        translationY: -2,
        heightRequest: 30,
        content: ui.createStackLayout({
            orientation: StackOrientation.HORIZONTAL,
            spacing: 0,
            children: [
                ui.createFrame({
                    column: 0,
                    horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
                    verticalOptions: LayoutOptions.FILL_AND_EXPAND,
                    borderColor: Color.fromRgba(0, 0, 0, 0),
                    children: [
                        ui.createLatexLabel({
                            column: 1,
                            horizontalTextAlignment: TextAlignment.CENTER,
                            verticalTextAlignment: TextAlignment.CENTER,
                            fontSize: 12,
                            text: () => `$${numberFormat(theory.tau, 2)}${theory.latexSymbol}$`,
                        }),
                    ],
                    isVisible: () => false,
                }),
                ui.createFrame({
                    column: 1,
                    horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
                    verticalOptions: LayoutOptions.FILL_AND_EXPAND,
                    borderColor: Color.fromRgba(0, 0, 0, 0),
                    children: [
                        ui.createLatexLabel({
                            column: 1,
                            horizontalTextAlignment: TextAlignment.CENTER,
                            verticalTextAlignment: TextAlignment.CENTER,
                            fontSize: 12,
                            text: () => `$${numberFormat(currency.value, 2)}\\rho$`,
                        }),
                    ],
                }),
                ui.createFrame({
                    column: 2,
                    horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
                    verticalOptions: LayoutOptions.FILL_AND_EXPAND,
                    borderColor: Color.fromRgba(0, 0, 0, 0),
                    children: [
                        ui.createLatexLabel({
                            column: 1,
                            horizontalTextAlignment: TextAlignment.CENTER,
                            verticalTextAlignment: TextAlignment.CENTER,
                            fontSize: 12,
                            text: () => `$${numberFormat(gammaCurrency.value, 2)}\\gamma$`,
                        }),
                    ],
                    isVisible: () => gammaResets > 0,
                }),
            ],
        }),
    });

    let conjecturesButton = ui.createFrame({
        heightRequest: 50,
        children: [
            ui.createLatexLabel({
                horizontalOptions: LayoutOptions.START,
                horizontalTextAlignment: TextAlignment.START,
                verticalTextAlignment: TextAlignment.CENTER,
                margin: new Thickness(15, 0, 15, 0),
                fontSize: 12,
                text: () => conjectureActiveData.id > -1 ? `Exit ${conjectures[conjectureActiveData.id].name()}` : `Conjectures`,
            }),
        ],
        onTouched: (e) => {
            if (e.type.isReleased()) {
                if (conjectureActiveData.id > -1) {
                    exitConjecture();
                    onGammaAdjustmentReset(true);
                } else {
                    createConjecturesMenu().show();
                }
            }
        },
        isVisible: () => achievement6.isUnlocked && stage === 1,
    });

    return ui.createStackLayout({
        orientation: StackOrientation.VERTICAL,
        spacing: 0,
        children: [
            currencyBar,
            conjecturesButton,
        ],
    });
};

var getEquationOverlay = () => {
    return ui.createGrid({
        columnSpacing: 0,
        children: [
            ui.createGrid({
                inputTransparent: true,
                cascadeInputTransparent: false,
                children: [
                    ui.createGrid({
                        row: 0, column: 0,
                        margin: new Thickness(4),
                        horizontalOptions: LayoutOptions.START,
                        verticalOptions: LayoutOptions.END,
                        inputTransparent: true,
                        cascadeInputTransparent: false,
                        children: [
                            gammaResetMenuFrame,
                        ],
                    }),
                ],
            }),
            ui.createGrid({
                columnDefinitions: ["1*", "3*", "1*"],
                columnSpacing: 0,
                children: [
                    ui.createFrame({
                        column: 1,
                        horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
                        verticalOptions: LayoutOptions.START,
                        children: [
                            ui.createProgressBar({
                                progress: () => conjectureActiveData.id > -1 ? Math.min(((1 + maxRho).log10() / conjectures[conjectureActiveData.id].goal(conjectureActiveData.difficulty).log10()).toNumber(), 1) : 0,
                            }),
                        ],
                        isVisible: () => conjectureActiveData.id > -1,
                    }),
                ],
            }),
        ],
    });
};

var createGammaResetMenu = () => {
    let resetButton = ui.createButton({
        text: `Reset`,
        onClicked: () => {
            let yesButton = ui.createButton({
                column: 0,
                text: "Yes",
            });

            let noButton = ui.createButton({
                column: 1,
                text: "No",
            });

            let confirmationPopup = ui.createPopup({
                title: "Gamma Adjustment Reset",
                content: ui.createStackLayout({
                    children: [
                        ui.createLatexLabel({
                            margin: new Thickness(0, 10, 0, 0),
                            horizontalTextAlignment: TextAlignment.CENTER,
                            text: `You are about to perform a Gamma Adjustment Reset.`,
                        }),
                        ui.createLatexLabel({
                            margin: new Thickness(0, 15, 0, 0),
                            horizontalTextAlignment: TextAlignment.CENTER,
                            text: `Do you want to continue?`,
                        }),
                        ui.createGrid({
                            margin: new Thickness(0, 10, 0, 0),
                            children: [
                                yesButton,
                                noButton,
                            ],
                        }),
                    ],
                }),
            });

            yesButton.onClicked = () => {
                onGammaAdjustmentReset(false);
                confirmationPopup.hide();
                popup.hide();
            };
            noButton.onClicked = () => confirmationPopup.hide();

            confirmationPopup.show();
        },
    });

    let resetChildren = [
        ui.createLatexLabel({
            horizontalTextAlignment: TextAlignment.CENTER,
            text: `After you perform $\\Gamma$ Adjustment Reset, you will have:`,
        }),
        ui.createGrid({
            rowDefinitions: ["*", "*"],
            columnDefinitions: ["*", "*"],
            children: [
                ui.createLatexLabel({
                    row: 0, column: 0,
                    horizontalTextAlignment: TextAlignment.CENTER,
                    text: `$\\rho$`,
                }),
                ui.createLatexLabel({
                    row: 1, column: 0,
                    horizontalTextAlignment: TextAlignment.CENTER,
                    text: () => `$${BigNumber.ZERO}$`,
                }),

                ui.createLatexLabel({
                    row: 0, column: 1,
                    horizontalTextAlignment: TextAlignment.CENTER,
                    text: `$\\gamma$`,
                }),
                ui.createLatexLabel({
                    row: 1, column: 1,
                    horizontalTextAlignment: TextAlignment.CENTER,
                    text: () => `$${gammaCurrency.value}$ + $${getGammaPending(maxRho)}$`,
                }),
            ],
        }),
        ui.createLatexLabel({
            horizontalTextAlignment: TextAlignment.CENTER,
            text: `$q_1$, $q_2$, $q_3$, $q_4$ and respective upgrades are reset.`,
        }),
        ui.createLatexLabel({
            horizontalTextAlignment: TextAlignment.CENTER,
            text: `You will also leave your current Conjecture.`,
            isVisible: () => conjectureActiveData.id > -1
        }),
        resetButton,
    ];

    let popup = ui.createPopup({
        isPeekable: true,
        title: `Gamma Adjustment`,
        content: ui.createStackLayout({
            children: resetChildren,
        }),
    });

    return popup;
};

let _conjecturesMenu;
var createConjecturesMenu = () => {
    let createConjecture = (id) => {
        const conj = conjectures[id];

        const completedDifficulty = conjecturesHighestCompletedDifficulties[id];
        const nextDifficulty = Math.min(completedDifficulty + 1, conj.maxDifficulty);

        let mainButton = ui.createFrame({
            heightRequest: 70,
            content: ui.createStackLayout({
                children: [
                    ui.createLatexLabel({
                        horizontalTextAlignment: TextAlignment.CENTER,
                        verticalTextAlignment: TextAlignment.CENTER,
                        margin: new Thickness(0, 8, 0, 0),
                        fontSize: 12,
                        text: () => `${conj.name()}: ${completedDifficulty}/${conj.maxDifficulty}`,
                    }),
                    ui.createLatexLabel({
                        horizontalTextAlignment: TextAlignment.CENTER,
                        verticalTextAlignment: TextAlignment.CENTER,
                        margin: new Thickness(0, -4, 0, 0),
                        fontSize: 10,
                        textColor: Color.TEXT_MEDIUM,
                        text: () => `Goal: ${conj.goal(nextDifficulty)}${currency.symbol}. ${conj.penalty(nextDifficulty)}`,
                    }),
                    ui.createLatexLabel({
                        horizontalTextAlignment: TextAlignment.CENTER,
                        verticalTextAlignment: TextAlignment.CENTER,
                        margin: new Thickness(0, -2, 0, 0),
                        fontSize: 10,
                        textColor: Color.TEXT_MEDIUM,
                        text: () => {
                            let text = `Reward: ${conj.reward(completedDifficulty)}`;
                            if (completedDifficulty < conj.maxDifficulty) {
                                text += ` $\\to$ ${conj.reward(nextDifficulty)}`;
                            }
                            return text;
                        },
                    }),
                ],
            }),
            onTouched: (e) => {
                if (e.type.isReleased()) {
                    let yesButton = ui.createButton({
                        column: 0,
                        text: "Yes",
                    });

                    let noButton = ui.createButton({
                        column: 1,
                        text: "No",
                    });

                    let popup = ui.createPopup({
                        title: conj.name(),
                        content: ui.createStackLayout({
                            children: [
                                ui.createLatexLabel({
                                    margin: new Thickness(0, 10, 0, 0),
                                    horizontalTextAlignment: TextAlignment.CENTER,
                                    text: `You are about to enter ${conj.name()}.`,
                                }),
                                ui.createLatexLabel({
                                    margin: new Thickness(0, 10, 0, 0),
                                    horizontalTextAlignment: TextAlignment.CENTER,
                                    text: `Entering will reset your current Gamma run and apply the Conjectures penalty.`,
                                }),
                                ui.createLatexLabel({
                                    margin: new Thickness(0, 15, 0, 0),
                                    horizontalTextAlignment: TextAlignment.CENTER,
                                    text: `Do you want to continue?`,
                                }),
                                ui.createGrid({
                                    margin: new Thickness(0, 10, 0, 0),
                                    children: [
                                        yesButton,
                                        noButton,
                                    ],
                                }),
                            ],
                        }),
                    });

                    yesButton.onClicked = () => {
                        popup.hide();
                        _conjecturesMenu.hide();

                        enterConjecture(id, Math.min(completedDifficulty + 1, conj.maxDifficulty))

                        stage = 0;
                        updateAvailability();
                    };
                    noButton.onClicked = () => popup.hide();

                    popup.show();
                }
            },
        });

        return mainButton;
    };

    return _conjecturesMenu = ui.createPopup({
        isPeekable: true,
        title: `Conjectures`,
        content: ui.createStackLayout({
            children: [
                createConjecture(0),
                createConjecture(1),
                createConjecture(2),
                createConjecture(3),
            ],
        }),
    });
};

var canGoToPreviousStage = () => stage > -1;

var goToPreviousStage = () => {
    stage--;
    updateAvailability();
};

var canGoToNextStage = () => {
    if (stage < 1 && gammaResets > 0) {
        return true;
    } else {
        return stage < 0;
    }
};

var goToNextStage = () => {
    stage++;
    updateAvailability();
};

var isCurrencyVisible = (index) => index === 0;
var getTau = () => BigNumber.ZERO;
var getPublicationMultiplier = (tau) => BigNumber.ONE;
var getPublicationMultiplierFormula = (symbol) => `\\text{There is no resolution.}`;
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

//
// Variable effects and value getters
//

var getTn = (tickspeedLevel) => tickspeedLevel + gammaup_gammaTickspeed.level;
var getTickspeed = (level = getTn(tickspeed.level)) => BigNumber.from(tickspeedConsts[level]);
var getDQ1 = (level = dq1.level) => Utils.getStepwisePowerSum(level, 2 + getGammaUpgGammaDQ1Scaling(), 9, 0) / 10;
var getDQ2 = (level = dq2.level) => Utils.getStepwisePowerSum(level, 2, 9, 0) / 10;
var getDQ3 = (level = dq3.level) => Utils.getStepwisePowerSum(level, 2, 9, 0) / 10;
var getDQ4 = (level = dq4.level) => Utils.getStepwisePowerSum(level, 2, 9, 0) / 10;

var getGammaPending = (rho = maxRho) => {
    if (conjectureActiveData.id > -1) return BigNumber.ZERO;

    const threshold = getGammaGainRhoThreshold();
    let result = rho >= threshold ? (rho / threshold).pow(getGammaGainScaling()) : BigNumber.ZERO;

    if (achievement3.isUnlocked) {
        result *= 2;
    }

    return result;
};
var getGammaUpgGammaMult = (level = gammaup_gammaMult.level) => BigNumber.from(1.8).pow(level);
var getGammaUpgGammaTimeMult_StepwiseScaling = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getGammaUpgGammaTimeMult = (level = gammaup_gammaTimeMult.level) => 1 + 1e-6 * getGammaUpgGammaTimeMult_StepwiseScaling(level) * t.pow(3);
var getGammaUpgGammaDQ2Factor = (level = gammaup_gammaDQ2Factor.level) => BigNumber.from(1.1).pow(level);
var getGammaUpgGammaQDecay = (level = gammaup_gammaQDecay.level) => BigNumber.from(2 * level);
var getGammaUpgGammaGainExp = (level = gammaup_gammaGainExp.level) => BigNumber.from(0.04 * level);
var getGammaUpgGammaDQ1Scaling = (level = gammaup_gammaDQ1Scaling.level) => 0.1 * level;

//
// Math
//

var productionSoftcap = (x) => {
    if (x > 1) {
        x = x.pow(0.8 + conjectures[3].getReward(conjecturesHighestCompletedDifficulties[3]));
    }
    if (conjectureActiveData.id === 3 && x > 1) {
        x = x.pow(0.5);
    }
    return x;
};

var productionSoftcapInverse = (x) => {
    if (x > 1) {
        x = x.pow(1 / (0.8 + conjectures[3].getReward(conjecturesHighestCompletedDifficulties[3])));
    }
    if (conjectureActiveData.id === 3 && x > 1) {
        x = x.pow(1 / 0.5);
    }
    return x;
};

var calculateXDxSoftcapped = (x, dx, initialThreshold = BigNumber.ONE, apply = [productionSoftcap, productionSoftcapInverse]) => {
    if (x < initialThreshold) {
        let new_x = x + dx;
        if (new_x >= initialThreshold) {
            new_x = apply[0](new_x / initialThreshold) * initialThreshold;
        }
        dx = new_x - x;
        x = new_x;
    } else {
        const new_x = apply[0](apply[1](x / initialThreshold) + dx / initialThreshold) * initialThreshold;
        dx = new_x - x;
        x = new_x;
    }
    return [x, dx];
};

init();