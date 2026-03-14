import { FreeCost, FirstFreeCost, ConstantCost, LinearCost, ExponentialCost, StepwiseCost, CompositeCost, CustomCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Vector3, Utils } from "./api/Utils";

import { ui } from "../api/ui/UI";
import { Aspect } from "../api/ui/properties/Aspect";
import { ClearButtonVisibility } from "../api/ui/properties/ClearButtonVisibility";
import { Color } from "../api/ui/properties/Color";
import { CornerRadius } from "../api/ui/properties/CornerRadius";
import { Easing } from "../api/ui/properties/Easing";
import { FontAttributes } from "../api/ui/properties/FontAttributes";
import { FontFamily } from "../api/ui/properties/FontFamily";
import { ImageSource } from "../api/ui/properties/ImageSource";
import { Keyboard } from "../api/ui/properties/Keyboard";
import { LayoutOptions } from "../api/ui/properties/LayoutOptions";
import { LineBreakMode } from "../api/ui/properties/LineBreakMode";
import { ReturnType } from "../api/ui/properties/ReturnType";
import { ScrollBarVisibility } from "../api/ui/properties/ScrollBarVisibility";
import { ScrollOrientation } from "../api/ui/properties/ScrollOrientation";
import { StackOrientation } from "../api/ui/properties/StackOrientation";
import { TextAlignment } from "../api/ui/properties/TextAlignment";
import { TextDecorations } from "../api/ui/properties/TextDecorations";
import { Thickness } from "../api/ui/properties/Thickness";
import { TouchEvent } from "../api/ui/properties/TouchEvent";
import { TouchType } from "../api/ui/properties/TouchType";

var id = "acoustic_theory";
var getName = (_) => {
    return `Acoustic Theory`;
};
var getDescription = (_) => {
    return `funny yact`;
};
var authors = "BasicallyIAmFox";
var version = 1;

var currency;
var rhodot = BigNumber.ZERO;
var a, adot = BigNumber.ZERO;
var T, Tdot = BigNumber.ZERO;
var c = BigNumber.ZERO, W = BigNumber.ZERO, I = BigNumber.ZERO, f = BigNumber.ZERO, k = BigNumber.ZERO, D = BigNumber.ZERO;

var c1, c2;
var a1, a2;
var T1;
var S;
var p;

var a2ExpMs;
var TRootMs;
var pMs;

var quaternaryEntries = [];
var stage = 1;

const DefaultAirPressure = 50;
const DefaultAirPressureCap = 40;
const DefaultTemperature = 292.15;

var aMilestoneConfirming = false, aMilestoneConfirmed = false, aMilestoneLevelDifference = 0, aPopup = ui.createPopup({
  title: "a Milestone",
  content: ui.createStackLayout({
    children: [
      ui.createLatexLabel({
        text: "Buying or refunding this milestone will reset $a$.",
        horizontalOptions: LayoutOptions.CENTER,
        horizontalTextAlignment: TextAlignment.CENTER,
        margin: new Thickness(0, 10, 0, 0),
      }),
      ui.createLatexLabel({
        text: "Do you want to continue?",
        horizontalOptions: LayoutOptions.CENTER,
        horizontalTextAlignment: TextAlignment.CENTER,
        margin: new Thickness(0, 15, 0, 15),
      }),
      ui.createStackLayout({
        orientation: StackOrientation.HORIZONTAL,
        children: [
          ui.createButton({
            horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
            text: "Yes",
            onClicked: () => {
              aMilestoneConfirmed = true;
              if (theory.milestonesUnused > 0 || aMilestoneLevelDifference < 0) {
                a2ExpMs.level += aMilestoneLevelDifference;
              }
              aPopup.hide();
            },
          }),
          ui.createButton({
            horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
            text: "No",
            onClicked: () => aPopup.hide(),
          }),
        ],
      }),
    ],
  }),
});
var TMilestoneConfirming = false, TMilestoneConfirmed = false, TMilestoneLevelDifference = 0, TPopup = ui.createPopup({
  title: "T Milestone",
  content: ui.createStackLayout({
    children: [
      ui.createLatexLabel({
        text: "Buying or refunding this milestone will reset $T$.",
        horizontalOptions: LayoutOptions.CENTER,
        horizontalTextAlignment: TextAlignment.CENTER,
        margin: new Thickness(0, 10, 0, 0),
      }),
      ui.createLatexLabel({
        text: "Do you want to continue?",
        horizontalOptions: LayoutOptions.CENTER,
        horizontalTextAlignment: TextAlignment.CENTER,
        margin: new Thickness(0, 15, 0, 15),
      }),
      ui.createStackLayout({
        orientation: StackOrientation.HORIZONTAL,
        children: [
          ui.createButton({
            horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
            text: "Yes",
            onClicked: () => {
              TMilestoneConfirmed = true;
              if (theory.milestonesUnused > 0 || TMilestoneLevelDifference < 0) {
                TRootMs.level += TMilestoneLevelDifference;
              }
              TPopup.hide();
            },
          }),
          ui.createButton({
            horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
            text: "No",
            onClicked: () => TPopup.hide(),
          }),
        ],
      }),
    ],
  }),
});

// taken from MF
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
            if (mts.startsWith('10')) {
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
    currency = theory.createCurrency();

    // Regular Upgrades

    {
        let getDesc = (level) => `c_1=${getC1(level).toString(0)}`;
        let getInfo = (level) => `c_1=${getC1(level).toString(0)}`;
        c1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(1, Math.log2(1.5))));
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
    }

    {
        let getDesc = (level) => `c_2=2^{${level}}`;
        let getInfo = (level) => `c_2=${getC2(level).toString(0)}`;
        c2 = theory.createUpgrade(1, currency, new ExponentialCost(10, Math.log2(10)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    {
        let getDesc = (level) => `T_1=${getT1(level).toString(0)}`;
        let getInfo = (level) => `T_1=${getT1(level).toString(0)}`;
        T1 = theory.createUpgrade(4, currency, new ExponentialCost(1e5, Math.log2(40)));
        T1.getDescription = (_) => Utils.getMath(getDesc(T1.level));
        T1.getInfo = (amount) => Utils.getMathTo(getInfo(T1.level), getInfo(T1.level + amount));
    }

    {
        let getDesc = (level) => `p=${getP(level).toString(0)}`;
        let getInfo = (level) => `p=${getP(level).toString(0)}`;
        p = theory.createUpgrade(6, currency, new ExponentialCost(1e15, Math.log2(1e15)));
        p.getDescription = (_) => Utils.getMath(getDesc(p.level));
        p.getInfo = (amount) => Utils.getMathTo(getInfo(p.level), getInfo(p.level + amount));
        p.isAvailable = false;
    }

    {
        let getDesc = (level) => `a_1=${getA1(level).toString(0)}`;
        let getInfo = (level) => `a_1=${getA1(level).toString(0)}`;
        a1 = theory.createUpgrade(2, currency, new ExponentialCost(1e3, Math.log2(40)));
        a1.getDescription = (_) => Utils.getMath(getDesc(a1.level));
        a1.getInfo = (amount) => Utils.getMathTo(getInfo(a1.level), getInfo(a1.level + amount));
    }

    {
        let getDesc = (level) => `a_2={0.8}^{${level}}`;
        let getInfo = (level) => `a_2^{${a2ExpMs.level > 0 ? 1 + a2ExpMs.level / 2 : ``}}=1/${getA2Reverse(level).toString(2)}`;
        a2 = theory.createUpgrade(3, currency, new ExponentialCost(1e4, Math.log2(1e2)));
        a2.getDescription = (_) => Utils.getMath(getDesc(a2.level));
        a2.getInfo = (amount) => Utils.getMathTo(getInfo(a2.level), getInfo(a2.level + amount));
    }

    {
        let getDesc = (level) => `S=${getS(level).toString(0)}`;
        let getInfo = (level) => `S=${getS(level).toString(0)}`;
        S = theory.createUpgrade(5, currency, new ExponentialCost(1e10, Math.log2(10)));
        S.getDescription = (_) => Utils.getMath(getDesc(S.level));
        S.getInfo = (amount) => Utils.getMathTo(getInfo(S.level), getInfo(S.level + amount));
    }

    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e20);

    {
        var aMilestoneConfirm = (levelDifference) => {
            if (aMilestoneConfirmed) {
                a = BigNumber.from(DefaultAirPressure);
                aMilestoneConfirmed = false;
            } else if (!aMilestoneConfirming) {
                aMilestoneConfirming = true;
                aMilestoneLevelDifference = levelDifference;
                a2ExpMs.level -= levelDifference;
                aPopup.show();
                aMilestoneConfirming = false;
            }
        };
        a2ExpMs = theory.createMilestoneUpgrade(0, 2);
        a2ExpMs.info = Localization.getUpgradeIncCustomExpInfo(`a_2`, `0.5`);
        a2ExpMs.description = Localization.getUpgradeIncCustomExpDesc(`a_2`, `0.5`);
        a2ExpMs.bought = (boughtLevels) => aMilestoneConfirm(boughtLevels);
        a2ExpMs.refunded = (refundedLevels) => aMilestoneConfirm(-refundedLevels);
    }

    {
        var TMilestoneConfirm = (levelDifference) => {
            if (TMilestoneConfirmed) {
                T = BigNumber.from(DefaultTemperature);
                TMilestoneConfirmed = false;
            } else if (!TMilestoneConfirming) {
                TMilestoneConfirming = true;
                TMilestoneLevelDifference = levelDifference;
                TRootMs.level -= levelDifference;
                TPopup.show();
                TMilestoneConfirming = false;
            }
        };
        TRootMs = theory.createMilestoneUpgrade(1, 2);
        TRootMs.getInfo = (level) => {
            if (level == 0) {
                return Utils.getMathTo(`\\sqrt{T}`, `\\sqrt[1.5]{T}`);
            }
            return Utils.getMathTo(`\\sqrt[1.5]{T}`, `T`);
        };
        TRootMs.getDescription = (level) => {
            if (level == 0) {
                return Utils.getMathTo(`\\sqrt{T}`, `\\sqrt[1.5]{T}`);
            }
            return Utils.getMathTo(`\\sqrt[1.5]{T}`, `T`);
        };
        TRootMs.bought = (boughtLevels) => TMilestoneConfirm(boughtLevels);
        TRootMs.refunded = (refundedLevels) => TMilestoneConfirm(-refundedLevels);
    }

    {
        pMs = theory.createMilestoneUpgrade(2, 1);
        pMs.info = Localization.getUpgradeUnlockInfo(`p`);
        pMs.description = Localization.getUpgradeUnlockDesc(`p`);
        pMs.boughtOrRefunded = (_) => {
            updateAvailability()
        };
    }

    // Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(15, 15));

    // Story Chapters
    theory.createStoryChapter(0, "The Beginnings", `You are an young engineer who is intrigued by the topic of acoustics.

You had spent quite a bit of time on a special machine that can produce arbitrary sounds.

While it may not seem impressive, it will allow you to dive deeper into the topic than the books let you.

You put the machine into an isolated area to not disturb the neighbors and begin the personal research.`, () => c1.level > 0);

    a = BigNumber.from(DefaultAirPressure);
    T = BigNumber.from(DefaultTemperature);

    updateAvailability();
};

var updateAvailability = () => {
    p.isAvailable = pMs.level > 0;
};

var getInternalState = () => JSON.stringify({
    a: a.toBase64String(),
    T: T.toBase64String()
});

var setInternalState = (stateStr) => {
    if(!stateStr) return;

    let state = JSON.parse(stateStr);
    a = (state.a) ? (BigNumber.fromBase64String(state.a) ?? a) : a;
    T = (state.T) ? (BigNumber.fromBase64String(state.T) ?? T) : T;
};

var tick = (elapsedTime, multiplier) => {
    if (c1.level == 0) return;

    let dt = BigNumber.from(elapsedTime);
    let bonus = theory.publicationMultiplier * multiplier;

    let vc1 = getC1(c1.level);
    let vc2 = getC2(c2.level);
    let va1 = getA1(a1.level);
    let va2 = getA2Reverse(a2.level);
    let vp1 = 1;
    let vT1 = getT1(T1.level);
    let vs = getS(S.level);

    c = 331.3196511181 + 0.6 * T;
    I = vp1 * vp1 / (a * c);
    W = I * vs;
    D = 10;
    f = 1.84 * c / (Math.PI * D);
    k = 2 * Math.PI * f / c;

    adot = (va1 / 1000) * (DefaultAirPressureCap - a * va2);
    a += dt * adot;
    a = a.max(DefaultAirPressureCap / va2);

    let vT = T;
    if (TRootMs.level === 0) vT = vT.pow(1 / 2);
    if (TRootMs.level === 1) vT = vT.pow(1 / 1.5);
    Tdot = vT1 * vT1 * (2 + vT / 10).log2();
    T += dt * Tdot;

    rhodot = bonus * 10 * W.pow(3.3) * c.pow(4.5) * vc1 * vc2 * k;
    currency.value += dt * rhodot;

    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();
};

var postPublish = () => {
    a = BigNumber.from(DefaultAirPressure);
    T = BigNumber.from(DefaultTemperature);
};

var getPrimaryEquation = () => {
    let result = ``;
    if (stage === 0) {
        theory.primaryEquationHeight = 80;

        result += `W = I S`;
        result += `\\\\`;
        result += `I = \\frac{p^2}{a c}`;
    } else if (stage === 1) {
        theory.primaryEquationHeight = 110;

        result += `\\dot{\\rho} = c_1 c_2 k c^{4.5} W^{3.3}`;
        result += `\\\\`;
        result += `\\dot{a} = \\frac{a_1}{1000} (${DefaultAirPressureCap} - \\frac{a}{a_2`;
        if (a2ExpMs.level === 1) result += `^{1.5}`;
        if (a2ExpMs.level === 2) result += `^2`;
        result += `})`;
        result += `\\\\`;
        result += `\\dot{T} = T_1^2 \\log_2(2 + `;
        if (TRootMs.level == 0) result += `\\sqrt{T}`;
        if (TRootMs.level == 1) result += `\\sqrt[1.5]{T}`;
        if (TRootMs.level == 2) result += `T`;
        result += ` / 10)`;
    }
    result += ``;
    return result;
};

var getSecondaryEquation = () => {
    let result = `\\begin{matrix}`;
    if (stage == 0) {
        result += `f = \\frac{1.84 c}{\\pi D}`;
        result += `&`;
        result += `k = 2 \\pi \\frac{f}{c}`;
    } else if (stage == 1) {
        result += `c = 331.32 + 0.6 T`;
    }
    result += `\\end{matrix}`;
    return result;
};

var getTertiaryEquation = () => {
    let result = `\\begin{matrix}`;
    if (stage == 0) {
        if (p.isAvailable) {
            result += `p = 1`;
        }
    } else if (stage == 1) {
        result += `${theory.latexSymbol} = \\max \\rho`;
    }
    result += `\\end{matrix}`;
    return result;
};

var getQuaternaryEntries = () => {
    if (quaternaryEntries.length == 0) {
        if (stage == 0) {
            quaternaryEntries.push(new QuaternaryEntry("f", null));
            quaternaryEntries.push(new QuaternaryEntry("I", null));
            quaternaryEntries.push(new QuaternaryEntry("D", null));
            quaternaryEntries.push(new QuaternaryEntry("k", null));
        } else if (stage == 1) {
            quaternaryEntries.push(new QuaternaryEntry("\\dot{\\rho}", null));
            quaternaryEntries.push(new QuaternaryEntry("a", null));
            quaternaryEntries.push(new QuaternaryEntry("T", null));
            quaternaryEntries.push(new QuaternaryEntry("c", null));
            quaternaryEntries.push(new QuaternaryEntry("W", null));
        }
    }

    if (stage == 0) {
        quaternaryEntries[0].value = f.toString(2);
        quaternaryEntries[1].value = numberFormat(I, 2);
        quaternaryEntries[2].value = D.toString(2);
        quaternaryEntries[3].value = k.toString(2);
    } else if (stage == 1) {
        quaternaryEntries[0].value = rhodot.toString(3);
        quaternaryEntries[1].value = numberFormat(a, 3);
        quaternaryEntries[2].value = T.toString(2);
        quaternaryEntries[3].value = c.toString(2);
        quaternaryEntries[4].value = numberFormat(W, 2);
    }

    return quaternaryEntries;
};

var canGoToPreviousStage = () => stage === 1;

var goToPreviousStage = () => {
    stage--;
    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    quaternaryEntries = [];
    theory.invalidateQuaternaryValues();
};

var canGoToNextStage = () => stage === 0;

var goToNextStage = () => {
    stage++;
    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    quaternaryEntries = [];
    theory.invalidateQuaternaryValues();
};

var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getC2 = (level) => BigNumber.TWO.pow(level);
var getA1 = (level) => Utils.getStepwisePowerSum(level, 2, 12, 1);
var getA2Reverse = (level) => BigNumber.from(1 / 0.8).pow(level * (1 + a2ExpMs.level / 2));
var getT1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getS = (level) => Utils.getStepwisePowerSum(level, 100, 100, 1);
var getP = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);

const pubPower = 0.2;
var getPublicationMultiplier = (tau) => tau.pow(pubPower);
var getPublicationMultiplierFormula = (symbol) => `{${symbol}}^{${pubPower}}`;
var getTau = () => currency.value;
var getCurrencyFromTau = (tau) => [ tau.max(BigNumber.ONE), currency.symbol ];
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

init();