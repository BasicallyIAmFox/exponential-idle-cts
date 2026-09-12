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
var achievement1, achievement2, achievement3, achievement4;

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
    1 / (2 ** 0),
];

var currency;
var maxRho = BigNumber.ZERO;
var q1 = BigNumber.ZERO, q2 = BigNumber.ZERO, q3 = BigNumber.ONE, q4 = BigNumber.ONE;
var dq1, dq2, dq3, dq4;
var visual_drho = BigNumber.ZERO;
var visual_dq1 = BigNumber.ZERO, visual_dq2 = BigNumber.ZERO, visual_dq3 = BigNumber.ZERO, visual_dq4 = BigNumber.ZERO;

var gammaCurrency;
var gammaCurrencyTotal = BigNumber.ZERO;
var gammaResets = 0;
var gammaup_gammaMult, gammaup_gammaTimeMult, gammaup_gammaTickspeed, gammaup_gammaGainExp;

var autobuyerUnlock, autobuyEnabled;
var autobuyerUnlockDQ1, autobuyerDQ1Configuration;
var autobuyerUnlockDQ2, autobuyerDQ2Configuration;
var autobuyerConfigurationUpgradeMapper = { };
var autobuyerConfiguration = {
    ["q1"]: {
        autobuyTimer: 999,
    },
    ["q2"]: {
        autobuyTimer: 999,
    },
    ["q3"]: {
        autobuyTimer: 999,
    },
    ["q4"]: {
        autobuyTimer: 999,
    },
};
var autobuyerConfigurationCooldown = {
    ["q1"]: 2,
    ["q2"]: 2,
    ["q3"]: 2,
    ["q4"]: 2,
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
        let getDesc = (level) => "\\dot{q}_1=" + getDQ1(level).toString(1) + "\\times q_2";
        let getInfo = (level) => "\\dot{q}_1=" + (getDQ1(level) * q2).toString(4);
        dq1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(0.1, Math.log2(2e2) / 2)));
        dq1.getDescription = (_) => Utils.getMath(getDesc(dq1.level));
        dq1.getInfo = (amount) => Utils.getMathTo(getInfo(dq1.level), getInfo(dq1.level + amount));
        autobuyerConfigurationUpgradeMapper["q1"] = dq1;
    }
    {
        let getDesc = (level) => "\\dot{q}_2=" + getDQ2(level).toString(1) + "\\times q_3";
        let getInfo = (level) => "\\dot{q}_2=" + (getDQ2(level) * q3).toString(4);
        dq2 = theory.createUpgrade(1, currency, new FirstFreeCost(new ExponentialCost(1, Math.log2(2e4) / 2)));
        dq2.getDescription = (_) => Utils.getMath(getDesc(dq2.level));
        dq2.getInfo = (amount) => Utils.getMathTo(getInfo(dq2.level), getInfo(dq2.level + amount));
        autobuyerConfigurationUpgradeMapper["q2"] = dq2;
    }
    {
        let getDesc = (level) => "\\dot{q}_3=" + getDQ3(level).toString(1) + "\\times q_4";
        let getInfo = (level) => "\\dot{q}_3=" + (getDQ3(level) * q4).toString(4);
        dq3 = theory.createUpgrade(2, currency, new ExponentialCost(10000, Math.log2(2e6) / 2));
        dq3.getDescription = (_) => Utils.getMath(getDesc(dq3.level));
        dq3.getInfo = (amount) => Utils.getMathTo(getInfo(dq3.level), getInfo(dq3.level + amount));
        autobuyerConfigurationUpgradeMapper["q3"] = dq3;
    }
    {
        let getDesc = (level) => "\\dot{q}_4=" + getDQ4(level).toString(1);
        let getInfo = (level) => "\\dot{q}_4=" + getDQ4(level).toString(4);
        dq4 = theory.createUpgrade(3, currency, new ExponentialCost(8e20, Math.log2(2e8) / 2));
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
        let getInfo = (level) => `n_t=${getTn(level)}`;
        tickspeed = theory.createPermanentUpgrade(3, currency, new ExponentialCost(2, Math.log2(80)));
        tickspeed.getDescription = (_) => Utils.getMath(getDesc(tickspeed.level));
        tickspeed.getInfo = (amount) => Utils.getMathTo(getInfo(tickspeed.level), getInfo(tickspeed.level + amount));
        tickspeed.maxLevel = 4;
    }
    
    {
        let getDesc = (level) => {
            if (level === 0) return `\\text{Add } \\gamma_1 \\text{ factor to } \\dot{\\rho} ; \\text{ } \\gamma_1 = 1.8^{1}`;

            return `\\gamma_1 = 1.8^{${level}}`;
        };
        let getInfo = (level) => {
            if (level === 0) return `\\text{Add } \\gamma_1 \\text{ factor to } \\dot{\\rho} ; \\text{ } \\gamma_1 = ${getGammaUpgGammaMult(0)}`;

            return `\\gamma_1 = ${getGammaUpgGammaMult(level)}`;
        };
        gammaup_gammaMult = theory.createUpgrade(10, gammaCurrency, new ExponentialCost(1, Math.log2(1.85)));
        gammaup_gammaMult.getDescription = (_) => Utils.getMath(getDesc(gammaup_gammaMult.level));
        gammaup_gammaMult.getInfo = (amount) => Utils.getMathTo(getInfo(gammaup_gammaMult.level), getInfo(gammaup_gammaMult.level + amount));
    }
    {
        let getDesc = (level) => {
            if (level === 0) return `\\text{Add } \\gamma_2 \\text{ factor to } \\dot{\\rho} ; \\text{ } \\gamma_2 = 1 + t^{(1 \\ \\uparrow \\ {0.6}) / 4}`;

            return `\\gamma_2 = 1 + t^{(${level} \\ \\uparrow \\ {0.6}) / 4}`;
        };
        let getInfo = (level) => {
            if (level === 0) return `\\text{Add } \\gamma_2 \\text{ factor to } \\dot{\\rho} ; \\text{ } \\gamma_2 = ${getGammaUpgGammaTimeMult(0)}`;

            return `\\gamma_2 = ${getGammaUpgGammaTimeMult(level)}`;
        };
        gammaup_gammaTimeMult = theory.createUpgrade(17, gammaCurrency, new ExponentialCost(1, Math.log2(1.7)));
        gammaup_gammaTimeMult.getDescription = (_) => Utils.getMath(getDesc(gammaup_gammaTimeMult.level));
        gammaup_gammaTimeMult.getInfo = (amount) => Utils.getMathTo(getInfo(gammaup_gammaTimeMult.level), getInfo(gammaup_gammaTimeMult.level + amount));
    }
    {
        let getDesc = (level) => {
            if (level === 0) return `\\text{Add } \\gamma_3 \\text{ term to } n_t ; \\text{ } \\gamma_3 = 0`;

            return `\\gamma_3 = ${level}`;
        };
        let getInfo = (level) => {
            if (level === 0) return `\\text{Add } \\gamma_3 \\text{ term to } n_t ; \\text{ } \\gamma_3 = 0`;

            return `\\gamma_3 = ${level}`;
        };
        gammaup_gammaTickspeed = theory.createUpgrade(19, gammaCurrency, new ExponentialCost(3, Math.log2(14.5)));
        gammaup_gammaTickspeed.getDescription = (_) => Utils.getMath(getDesc(gammaup_gammaTickspeed.level));
        gammaup_gammaTickspeed.getInfo = (amount) => Utils.getMathTo(getInfo(gammaup_gammaTickspeed.level), getInfo(gammaup_gammaTickspeed.level + amount));
        gammaup_gammaTickspeed.maxLevel = tickspeedConsts.length - tickspeed.maxLevel - 1;
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
        autobuyerUnlock = theory.createUpgrade(11, gammaCurrency, new ConstantCost(5));
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
        
        autobuyerDQ1Configuration = theory.createUpgrade(14, gammaCurrency, new FreeCost());
        autobuyerDQ1Configuration.description = `Configure $\\dot{q_1}$ auto-buyer settings`;
        autobuyerDQ1Configuration.bought = (_) => {
            autobuyerDQ1Configuration.level = 0;
        };
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
        
        autobuyerDQ2Configuration = theory.createUpgrade(16, gammaCurrency, new FreeCost());
        autobuyerDQ2Configuration.description = `Configure $\\dot{q_2}$ auto-buyer settings`;
        autobuyerDQ2Configuration.bought = (_) => {
            autobuyerDQ2Configuration.level = 0;
        };
    }

    let achievement_category1 = theory.createAchievementCategory(0, "Progression");
    {
        achievement1 = theory.createAchievement(0, achievement_category1, "Achievements are the way to go", `Reach 1ρ, 1 q₁, or 1 q₂.\n\nReward: all production above 1 is powered by 0.8.`, () => currency.value >= 1 || q1 >= 1 || q2 >= 1);
        achievement2 = theory.createAchievement(1, achievement_category1, "No progress", `Let q₃ and q₄ fall below 0.001.\n\nReward: initial q₃ value is multiplied by 1.2.`, () => q3 < 0.001 && q4 < 0.001);
        achievement3 = theory.createAchievement(2, achievement_category1, "Decay was too strong", `Perform a gamma reset.\n\nReward: multiply γ gain by 2.`, () => gammaResets > 0);
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
    }

    updateAvailability();
};

var updateAvailability = () => {
    autobuyerUnlock.isAvailable = gammaResets > 0 && stage === -1 && autobuyerUnlock.level < 1;
    autobuyEnabled.isAvailable = gammaResets > 0 && stage === -1 && autobuyerUnlock.level > 0;
    autobuyerUnlockDQ1.isAvailable = autobuyEnabled.isAvailable && autobuyerUnlockDQ1.level < 1;
    autobuyerDQ1Configuration.isAvailable = autobuyEnabled.isAvailable && autobuyerUnlockDQ1.level > 0;
    autobuyerUnlockDQ2.isAvailable = autobuyEnabled.isAvailable && autobuyerUnlockDQ2.level < 1;
    autobuyerDQ2Configuration.isAvailable = autobuyEnabled.isAvailable && autobuyerUnlockDQ2.level > 0;

    dq1.isAvailable = stage === 0;
    dq2.isAvailable = stage === 0;
    dq3.isAvailable = stage === 0;
    dq4.isAvailable = stage === 0;

    gammaup_gammaMult.isAvailable = stage === 1;
    gammaup_gammaTimeMult.isAvailable = stage === 1;
    gammaup_gammaTickspeed.isAvailable = stage === 1;
    gammaup_gammaGainExp.isAvailable = stage === 1;
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
    if (state.autobuyerConfiguration) autobuyerConfiguration = state.autobuyerConfiguration;
};

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier) * getTickspeed();
    let bonus = theory.publicationMultiplier;

    localDeltaTime = dt;

    visual_dq1 = visual_dq2 = visual_dq3 = visual_dq4 = BigNumber.ZERO;
    if (dq1.level > 0) {
        // TODO: DE
        let old_q1 = q1, old_q2 = q2, old_q3 = q3, old_q4 = q4;
        let dq1 = getDQ1() * q2;
        let dq2 = getDQ2() * q3;
        let dq3 = getDQ3() * q4;
        let dq4 = getDQ4();
        let q1_dq1 = calculateXDxSoftcapped(q1, dq1 * dt);
        let q2_dq2 = calculateXDxSoftcapped(q2, dq2 * dt);
        let q3_dq3 = calculateXDxSoftcapped(q3, dq3 * dt);
        let q4_dq4 = calculateXDxSoftcapped(q4, dq4 * dt);
        q1 = q1_dq1[0] - q1 / 100 * dt;
        q2 = q2_dq2[0] - q2 / 100 * dt;
        q3 = q3_dq3[0] - q3 / 100 * dt;
        q4 = q4_dq4[0] - q4 / 100 * dt;
        dq1 = q1_dq1[1] - q1 / 100 * dt;
        dq2 = q2_dq2[1] - q2 / 100 * dt;
        dq3 = q3_dq3[1] - q3 / 100 * dt;
        dq4 = q4_dq4[1] - q4 / 100 * dt;
        visual_dq1 = (q1 - old_q1) / dt;
        visual_dq2 = (q2 - old_q2) / dt;
        visual_dq3 = (q3 - old_q3) / dt;
        visual_dq4 = (q4 - old_q4) / dt;

        t += dt;
    }

    let old_rho = currency.value;
    let drho = getGammaUpgGammaMult() * getGammaUpgGammaTimeMult() * q1;
    let rho_drho = calculateXDxSoftcapped(currency.value, drho * dt);
    currency.value = rho_drho[0]; drho = rho_drho[1];
    visual_drho = (currency.value - old_rho) / dt;
    if (currency.value > maxRho) {
        maxRho = currency.value;
    }

    autobuyEnabled.isAutoBuyable = false;
    autobuyerDQ1Configuration.isAutoBuyable = false;
    autobuyerDQ2Configuration.isAutoBuyable = false;
    if (autobuyEnabled.level < 1) {
        const autobuyDt = dt;

        Object.keys(autobuyerConfiguration).forEach(key => {
            const value = autobuyerConfiguration[key];
            if (!value.enabled) return;

            const cooldown = autobuyerConfigurationCooldown[key];
            value.autobuyTimer = Math.min(value.autobuyTimer - autobuyDt, cooldown);
            if (value.autobuyTimer <= 0) {
                const upgrade = autobuyerConfigurationUpgradeMapper[key];
                const prev_available = upgrade.isAvailable;
                upgrade.isAvailable = true;
                if (upgrade.isAutoBuyable) {
                    upgrade.buy(1);
                }
                upgrade.isAvailable = prev_available;
                value.autobuyTimer = cooldown;
            }
        });
    }

    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();
};

var onGammaAdjustmentReset = () => {
    const dgamma = getGammaPending(currency.value);
    gammaCurrency.value += dgamma;
    gammaCurrencyTotal += dgamma;
    currency.value = BigNumber.ZERO;

    dq1.level = dq2.level = dq3.level = dq4.level = 0;
    q1 = q2 = BigNumber.ZERO;
    q3 = q4 = BigNumber.ONE;

    if (achievement2.isUnlocked) {
        q3 *= 1.2;
    }

    autobuyerConfiguration.q1.autobuyTimer = autobuyerConfigurationCooldown.q1;
    autobuyerConfiguration.q2.autobuyTimer = autobuyerConfigurationCooldown.q2;
    autobuyerConfiguration.q3.autobuyTimer = autobuyerConfigurationCooldown.q3;
    autobuyerConfiguration.q4.autobuyTimer = autobuyerConfigurationCooldown.q4;

    t = BigNumber.ZERO;
    gammaResets++;
    maxRho = BigNumber.ZERO;
    theory.clearGraph();
};

var postPublish = () => {
};

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

var getPrimaryEquation = () => {
    let result = `\\begin{array}{}`;

    if (stage === -1) {
        result += `\\dot{\\rho} = ${visual_drho.toString(2)}`;
    }
    else if (stage === 0) {
        let rhodot = ``;
        if (gammaup_gammaMult.level > 0) rhodot += `\\gamma_1 `;
        if (gammaup_gammaTimeMult.level > 0) rhodot += `\\gamma_2 `;
        rhodot += `q_1`;
        result += `\\dot{\\rho} = ${rhodot}`;
    }
    else if (stage === 1) {
        let base = `(\\bar{\\rho})^{0.2 + \\gamma_6}`;
        if (achievement3.isUnlocked) {
            base = `2 \\times ${base}`;
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
            result += `(\\forall x)(x > 1 \\Rightarrow \\dot{x} = (x^{1.25} + \\dot{x})^{0.8} - x) \\\\`;
        }
        result += `(\\forall q)(\\dot{q} = \\dot{q} - q / 100)`;
    }
    else if (stage === 1) {
        theory.secondaryEquationHeight = 20;
        theory.secondaryEquationScale = 1;

        result += `\\bar{\\rho} = \\max {\\rho / 1000}`;
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
        entries.push(new QuaternaryEntry("\\bar{\\rho}", maxRho / 1000));
    }

    return entries;
};

var getCurrencyBarDelegate = () => {
    return ui.createFrame({
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

var getEquationOverlay = () => {
    return ui.createGrid({
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
                onGammaAdjustmentReset();
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
            columnDefinitions: ["*"],
            children: [
                ui.createLatexLabel({
                    row: 0, column: 0,
                    horizontalTextAlignment: TextAlignment.CENTER,
                    text: `$\\gamma$`,
                }),
                ui.createLatexLabel({
                    row: 1, column: 0,
                    horizontalTextAlignment: TextAlignment.CENTER,
                    text: () => `$${gammaCurrency.value}$ + $${getGammaPending(maxRho)}$`,
                }),
            ],
        }),
        ui.createLatexLabel({
            horizontalTextAlignment: TextAlignment.CENTER,
            text: `$\\rho$, $q_1$, $q_2$, $q_3$, $q_4$ and respective upgrades are reset.`,
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

var getTn = (tickspeedLevel) => tickspeedLevel + gammaup_gammaTickspeed.level;
var getTickspeed = (level = getTn(tickspeed.level)) => BigNumber.from(tickspeedConsts[level]);
var getDQ1 = (level = dq1.level) => Utils.getStepwisePowerSum(level, 2, 10, 0) / 10;
var getDQ2 = (level = dq2.level) => Utils.getStepwisePowerSum(level, 2, 10, 0) / 10;
var getDQ3 = (level = dq3.level) => Utils.getStepwisePowerSum(level, 2, 10, 0) / 10;
var getDQ4 = (level = dq4.level) => Utils.getStepwisePowerSum(level, 2, 10, 0) / 10;

var getGammaPending = (rho = maxRho) => {
    let result = rho >= 1000 ? (rho / 1000).pow(0.2 + getGammaUpgGammaGainExp()) : BigNumber.ZERO;

    if (achievement3.isUnlocked) {
        result *= 2;
    }

    return result;
};
var getGammaUpgGammaMult = (level = gammaup_gammaMult.level) => BigNumber.from(1.8).pow(level);
var getGammaUpgGammaTimeMult = (level = gammaup_gammaTimeMult.level) => 1 + t.pow(level ** 0.6 / 4);
var getGammaUpgGammaGainExp = (level = gammaup_gammaGainExp.level) => 0.04 * level;

var productionSoftcap = (x) => {
    if (x > 1) {
        x = x.pow(0.8);
    }
    return x;
};

var productionSoftcapInverse = (x) => {
    if (x > 1) {
        x = x.pow(1 / 0.8);
    }
    return x;
};

var calculateXDxSoftcapped = (x, dx, initialThreshold = BigNumber.ONE, apply = [productionSoftcap, productionSoftcapInverse]) => {
    if (x < initialThreshold) {
        let new_x = x + dx;
        if (new_x >= initialThreshold) {
            new_x = apply[0](new_x - initialThreshold) + initialThreshold;
        }
        dx = new_x - x;
        x = new_x;
    } else {
        const new_x = apply[0](apply[1](x) + dx);
        dx = new_x - x;
        x = new_x;
    }
    return [x, dx];
};

init();