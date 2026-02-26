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
import { log } from "console";

var id = "theory_of_everything";
var getName = (_) => {
    return `Theory of Everything`;
};
var getDescription = (_) => {
    return `funny yact`;
};
var authors = "BasicallyIAmFox";
var version = 0;

var rhoN = BigNumber.ZERO;
var rhoNm1 = BigNumber.ZERO;
var rhoNm2 = BigNumber.ZERO;
var time = 0;

var currency, currency2;
var q1 = BigNumber.ONE, q2 = BigNumber.ONE, q3 = BigNumber.ONE;
var r = BigNumber.ONE;
var c1, c2;
var q11, q12, q22, q23, q31, q33;
var r1, r2;

var msQ;

var init = () => {
    currency = theory.createCurrency();
    currency2 = theory.createCurrency();

    {
        let getDesc = (level) => "c_1=" + getC1(level).toString(0);
        let getInfo = (level) => "c_1=" + getC1(level).toString(0);
        c1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(5, Math.log2(1.8))));
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
    }
    {
        let getDesc = (level) => "c_2=2^{" + level.toString() + "}";
        let getInfo = (level) => "c_2=" + getC2(level).toString(0);
        c2 = theory.createUpgrade(1, currency, new ExponentialCost(100, Math.log2(4.5)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }
    {
        let getDesc = (level) => "r_1=" + getR1(level).toString(0);
        let getInfo = (level) => "r_1=" + getR1(level).toString(0);
        r1 = theory.createUpgrade(8, currency, new ExponentialCost(1e10, Math.log2(1.65)));
        r1.getDescription = (_) => Utils.getMath(getDesc(r1.level));
        r1.getInfo = (amount) => Utils.getMathTo(getInfo(r1.level), getInfo(r1.level + amount));
    }
    {
        let getDesc = (level) => "r_2=2^{" + level.toString() + "}";
        let getInfo = (level) => "r_2=" + getR2(level).toString(0);
        r2 = theory.createUpgrade(9, currency, new ExponentialCost(1e12, Math.log2(90)));
        r2.getDescription = (_) => Utils.getMath(getDesc(r2.level));
        r2.getInfo = (amount) => Utils.getMathTo(getInfo(r2.level), getInfo(r2.level + amount));
    }
    {
        let getDesc = (level) => "q_{11}=2^{" + level.toString() + "}";
        let getInfo = (level) => "q_{11}=" + getQ11(level).toString(0);
        q11 = theory.createUpgrade(2, currency, new ExponentialCost(1e10, Math.log2(7.3496)));
        q11.getDescription = (_) => Utils.getMath(getDesc(q11.level));
        q11.getInfo = (amount) => Utils.getMathTo(getInfo(q11.level), getInfo(q11.level + amount));
    }
    {
        let getDesc = (level) => "q_{12}=2^{" + level.toString() + "}";
        let getInfo = (level) => "q_{12}=" + getQ12(level).toString(0);
        q12 = theory.createUpgrade(3, currency, new ExponentialCost(1e10, Math.log2(12.3496)));
        q12.getDescription = (_) => Utils.getMath(getDesc(q12.level));
        q12.getInfo = (amount) => Utils.getMathTo(getInfo(q12.level), getInfo(q12.level + amount));
    }
    {
        let getDesc = (level) => "q_{22}=2^{" + level.toString() + "}";
        let getInfo = (level) => "q_{22}=" + getQ22(level).toString(0);
        q22 = theory.createUpgrade(4, currency, new ExponentialCost(1e10, Math.log2(11.3496)));
        q22.getDescription = (_) => Utils.getMath(getDesc(q22.level));
        q22.getInfo = (amount) => Utils.getMathTo(getInfo(q22.level), getInfo(q22.level + amount));
    }
    {
        let getDesc = (level) => "q_{23}=2^{" + level.toString() + "}";
        let getInfo = (level) => "q_{23}=" + getQ23(level).toString(0);
        q23 = theory.createUpgrade(5, currency, new ExponentialCost(1e10, Math.log2(8.5496)));
        q23.getDescription = (_) => Utils.getMath(getDesc(q23.level));
        q23.getInfo = (amount) => Utils.getMathTo(getInfo(q23.level), getInfo(q23.level + amount));
    }
    {
        let getDesc = (level) => "q_{31}=2^{" + level.toString() + "}";
        let getInfo = (level) => "q_{31}=" + getQ31(level).toString(0);
        q31 = theory.createUpgrade(6, currency, new ExponentialCost(1e12, Math.log2(10.3496)));
        q31.getDescription = (_) => Utils.getMath(getDesc(q31.level));
        q31.getInfo = (amount) => Utils.getMathTo(getInfo(q31.level), getInfo(q31.level + amount));
    }
    {
        let getDesc = (level) => "q_{33}=2^{" + level.toString() + "}";
        let getInfo = (level) => "q_{33}=" + getQ33(level).toString(0);
        q33 = theory.createUpgrade(7, currency, new ExponentialCost(1e10, Math.log2(9.3496)));
        q33.getDescription = (_) => Utils.getMath(getDesc(q33.level));
        q33.getInfo = (amount) => Utils.getMathTo(getInfo(q33.level), getInfo(q33.level + amount));
    }
    
    theory.createPublicationUpgrade(0, currency, 1e7);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    theory.setMilestoneCost(new LinearCost(10, 25));
    {
        msQ = theory.createMilestoneUpgrade(0, 3);
        msQ.getDescription = (_) => {
            if (msQ.level == 0)
                return `${Localization.getUpgradeUnlockDesc("q_1")}; ${Localization.getUpgradeUnlockDesc("q_2")}`;
            else if (msQ.level == 1)
                return Localization.getUpgradeUnlockDesc("q_3");
            else
                return `Use $q_1^{0.06}$ instead of $1$`;
        };
        msQ.getInfo = (_) => {
            if (msQ.level == 0)
                return `${Localization.getUpgradeUnlockInfo("q_1")} \\\\ ${Localization.getUpgradeUnlockInfo("q_2")}`;
            else if (msQ.level == 1)
                return Localization.getUpgradeUnlockInfo("q_3");
            else {
                let a = `\\begin{bmatrix}q_2^{0.06}\\\\1\\\\q_3^{0.06}\\end{bmatrix}`;
                let b = `\\begin{bmatrix}q_2^{0.06}\\\\q_1^{0.06}\\\\q_3^{0.06}\\end{bmatrix}`;
                return Utils.getMathTo(a, b);
            }
        };
        msQ.canBeRefunded = (_) => msR.level == 0;
        msQ.boughtOrRefunded = (_) => updateAvailability();
    }
    {
        msR = theory.createMilestoneUpgrade(1, 1);
        msR.getDescription = (_) => Localization.getUpgradeUnlockDesc("r");
        msR.getInfo = (_) => Localization.getUpgradeUnlockInfo("r");
        msR.boughtOrRefunded = (_) => updateAvailability();
    }

    updateAvailability();
};

var updateAvailability = () => {
    msR.isAvailable = msQ.level > 1;
    q11.isAvailable = msQ.level > 0;
    q12.isAvailable = msQ.level > 1;
    q22.isAvailable = msQ.level > 1;
    q23.isAvailable = msQ.level > 0;
    q31.isAvailable = msQ.level > 1;
    q33.isAvailable = msQ.level > 1;
    r1.isAvailable = msR.level > 0;
    r2.isAvailable = msR.level > 0;
};

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;

    let vc1 = getC1(c1.level);
    let vc2 = getC2(c2.level);
    let vq11 = getQ11(q11.level);
    let vq12 = q12.isAvailable ? getQ12(q12.level) : BigNumber.ZERO;
    let vq22 = q22.isAvailable ? getQ22(q22.level) : BigNumber.ZERO;
    let vq23 = getQ23(q23.level);
    let vq31 = q31.isAvailable ? getQ31(q31.level) : BigNumber.ZERO;
    let vq33 = q33.isAvailable ? getQ33(q33.level) : BigNumber.ZERO;
    let vr1 = r1.isAvailable ? getR1(r1.level) : BigNumber.ZERO;
    let vr2 = r2.isAvailable ? getR2(r2.level) : BigNumber.ZERO;

    if (vr2 != BigNumber.ZERO) {
        let dr = (vr1 * vr1 + vr1).sqrt() / vr2 * r * (1 - r / vr2) * dt;
        r = r + dr.max(BigNumber.ZERO);
        r = r.min(vr2);
    }

    {
        let q1Term = msQ.level > 2 ? q1.pow(0.06) : BigNumber.ONE;
        let q2Term = q2.pow(0.06);
        let q3Term = msQ.level > 2 ? q3.pow(0.06) : BigNumber.ONE;

        q1 += dt * (vq11 * q2Term + vq12.pow(1.1) * q3Term);
        q2 += dt * (vq22.pow(1.1) * q3Term + vq23 * q1Term);
        q3 += dt * (vq31.pow(1.1) * q2Term + vq33 * q1Term);
    }

    let timeLimit = 0.1;
    time += elapsedTime;
    if (time >= timeLimit - 1e-8) {
        let tickPower = BigNumber.from(time * multiplier);

        rhoNm2 = rhoNm1;
        rhoNm1 = rhoN;
        rhoN = currency.value;

        let term1 = vc1 * vc2;

        let dRho = term1;
        if (msQ.level > 0) dRho *= q1;

        currency.value = rhoN + bonus * tickPower * dRho;
        time = 0;
    }
    
    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();
};

var postPublish = () => {
    q1 = q2 = q3 = BigNumber.ONE;
    r = BigNumber.ONE;
};

var getPrimaryEquation = () => {
    let result = ``;
    result += `\\rho_{n+1}=\\rho_n+`;
    result += `c_1c_2`;
    if (msQ.level > 0) result += `q_1`;
    if (msR.level > 0) result += `r`;
    result += ``;
    return result;
};

var getSecondaryEquation = () => {
    let result = ``;
    if (msQ.level > 0) {
        result += `\\begin{bmatrix}`;
        result += `\\dot{q_1}\\\\\\dot{q_2}`;
        if (msQ.level > 1) result += `\\\\\\dot{q_3}`;
        result += `\\end{bmatrix}=\\begin{bmatrix}`;
        result += `q_{11}&`;
        if (msQ.level > 1) result += `q_{12}^{1.1}`; else result += `0`;
        result += `\\\\`;
        if (msQ.level > 1) result += `q_{22}^{1.1}`; else result += `0`;
        result += `&q_{23}`;
        if (msQ.level > 1) result += `\\\\q_{31}^{1.1}&q_{33}`;
        result += `\\end{bmatrix}\\begin{bmatrix}`;
        result += `q_2^{0.06}\\\\`;
        if (msQ.level == 1) result += `1`;
        if (msQ.level == 2) result += `1\\\\q_3^{0.06}`;
        if (msQ.level == 3) result += `q_1^{0.06}\\\\q_3^{0.06}`;
        result += `\\end{bmatrix}`;

        theory.secondaryEquationHeight = 70;
    }
    if (msR.level > 0) {
        result += `\\\\\\dot{r}=\\frac{\\sqrt{r_1^2+r_1}}{r_2}r(1-\\frac{r}{r_2})`;

        theory.secondaryEquationHeight = 90;
    }
    result += ``;

    return result;
};

var getQuaternaryEntries = () => {
    let quaternaryEntries = [];
    if (msQ.level > 0) {
        quaternaryEntries.push(new QuaternaryEntry("q_1", q1.toString(2)));
        quaternaryEntries.push(new QuaternaryEntry("q_2", q2.toString(2)));
        if (msQ.level > 1) quaternaryEntries.push(new QuaternaryEntry("q_3", q3.toString(2)));
    }
    if (msR.level > 0) {
        quaternaryEntries.push(new QuaternaryEntry("r", r.toString(2)));
    }
    return quaternaryEntries;
};

var isCurrencyVisible = (index) => index === 0;
var getTau = () => currency.value;
var getPublicationMultiplier = (tau) => 6.3095734448 * tau.pow(0.08);
var getPublicationMultiplierFormula = (symbol) => "6.31 {" + symbol + "}^{0.08}";
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getC1 = (level) => {
    if (level >= 37) {
        let base = Utils.getStepwisePowerSum(37, 2, 10, 0);
        return Utils.getStepwisePowerSum(level - 37, 2, 11, 0) * 2 ** 3 + base;
    } else {
        return Utils.getStepwisePowerSum(level, 2, 10, 0);
    }
};
var getC2 = (level) => BigNumber.TWO.pow(level);
var getQ11 = (level) => BigNumber.TWO.pow(level);
var getQ12 = (level) => BigNumber.TWO.pow(level);
var getQ22 = (level) => BigNumber.TWO.pow(level);
var getQ23 = (level) => BigNumber.TWO.pow(level);
var getQ31 = (level) => BigNumber.TWO.pow(level);
var getQ33 = (level) => BigNumber.TWO.pow(level);
var getR1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getR2 = (level) => BigNumber.TWO.pow(level);

init();