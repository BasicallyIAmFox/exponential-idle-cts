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
var version = 2;

var currency, t = BigNumber.ZERO;
var v = [BigNumber.ZERO, BigNumber.ZERO, BigNumber.ZERO];
var I = [BigNumber.ZERO, BigNumber.ZERO, BigNumber.ZERO];

var c1, c2, v1, v2, v3, p, temperature;
var msDimension, msTemperature;

var quaternaryEntries = [];

var init = () => {
    currency = theory.createCurrency();

    {
        let getDesc = (level) => `c_1=${getC1(level).toString(0)}`;
        let getInfo = (level) => `c_1=${getC1(level).toString(0)}`;
        c1 = theory.createUpgrade(0, currency, new FreeCost());
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
    }
    {
        let getDesc = (level) => `c_2=${getC2(level).toString(0)}`;
        let getInfo = (level) => `c_2=2^{${level}}`;
        c2 = theory.createUpgrade(1, currency, new FreeCost());
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    {
        let getDesc = (level) => `v_1=`;
        let getInfo = (level) => `v_1=`;
        v1 = theory.createUpgrade(2, currency, new FreeCost());
        v1.getDescription = (_) => Utils.getMath(getDesc(v1.level));
        v1.getInfo = (amount) => Utils.getMathTo(getInfo(v1.level), getInfo(v1.level + amount));
    }
    {
        let getDesc = (level) => `v_2=`;
        let getInfo = (level) => `v_2=`;
        v2 = theory.createUpgrade(3, currency, new FreeCost());
        v2.getDescription = (_) => Utils.getMath(getDesc(v2.level));
        v2.getInfo = (amount) => Utils.getMathTo(getInfo(v2.level), getInfo(v2.level + amount));
    }
    {
        let getDesc = (level) => `v_3=`;
        let getInfo = (level) => `v_3=`;
        v3 = theory.createUpgrade(4, currency, new FreeCost());
        v3.getDescription = (_) => Utils.getMath(getDesc(v3.level));
        v3.getInfo = (amount) => Utils.getMathTo(getInfo(v3.level), getInfo(v3.level + amount));
    }

    {
        let getDesc = (level) => `p=${getP(level).toString(0)}`;
        let getInfo = (level) => `p=${getP(level).toString(0)}`;
        p = theory.createUpgrade(5, currency, new FreeCost());
        p.getDescription = (_) => Utils.getMath(getDesc(p.level));
        p.getInfo = (amount) => Utils.getMathTo(getInfo(p.level), getInfo(p.level + amount));
    }

    {
        let suffix = `\\text{ K}`;
        let getDesc = (level) => `T=${getTemperature(level).toString(2)} ${suffix}`;
        let getInfo = (level) => `T=${getTemperature(level).toString(2)} ${suffix}`;
        temperature = theory.createUpgrade(6, currency, new FreeCost());
        temperature.getDescription = (_) => Utils.getMath(getDesc(temperature.level));
        temperature.getInfo = (amount) => Utils.getMathTo(getInfo(temperature.level), getInfo(temperature.level + amount));
    }

    theory.createStoryChapter(0, "The Beginnings", `You are an young engineer
        who is intrigued by the topic of acoustics.

        You had spent quite a bit of time on
        a special machine that can produce arbitrary sounds.

        While it may not seem impressive, it will allow you to
        dive deeper into the topic than the books let you.

        You put the machine into an isolated area
        to not disturb the neighbors
        and begin the personal research.`, () => c1.level > 0);
};

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime);
    let bonus = theory.publicationMultiplier * multiplier;

    let v1 = getV1(v1.level);
    let v2 = getV2(v2.level);
    let v3 = getV3(v3.level);
    let pressureVar = getP(p.level);
    let temperatureVar = getTemperature(temperature.level);

    v[0] += dt * v1 * v2;
    v[1] += dt * v2 * v3;
    v[2] += dt * v3 * v1;
    I[0] = pressureVar * v[0];
    I[1] = pressureVar * v[1];
    I[2] = pressureVar * v[2];

    let speedOfSound = 331.3196511181 * (1 + temperatureVar / 273.15).sqrt();
    let speedIntensityRMS = ((I[0] * I[0] + I[1] * I[1] + I[2] * I[2]) / BigNumber.THREE).sqrt();

    let rhodot = bonus * getC1(c1.level) * getC2(c2.level);

    t += dt;

    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();
};

var getPrimaryEquation = () => {
    let result = `\\begin{array}{cl}`;
    result += `c = \\gamma \\sqrt{1 + \\frac{T}{273.15}}`;
    result += `\\end{array}`;
    return result;
};

var getSecondaryEquation = () => {
    let result = `\\begin{matrix}{cl}`;
    result += `\\gamma \\approx 331.32`;
    result += `\\end{matrix}`;
    return result;
};

var getTertiaryEquation = () => {
    return ``;
};

var getQuaternaryEntries = () => {
    if (quaternaryEntries.length == 0) {
        quaternaryEntries.push(new QuaternaryEntry("t", null));
    }

    quaternaryEntries[0].value = t.toString(2);
    return quaternaryEntries;
};

var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getC2 = (level) => BigNumber.TWO.pow(level);
var getV1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getV2 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getV3 = (level) => BigNumber.TWO.pow(level);
var getP = (level) => Utils.getStepwisePowerSum(level, 2, 8, 1);
var getTemperature = (level) => 5 * Utils.getStepwisePowerSum(level, 2, 10, 0);

var getUpgradeListDelegate = () => {
    let upgradeBuyables = [];
    for (let i = 0; i < theory.upgrades().length; i++) {
        const upgrade = theory.upgrades()[i];
        
        upgradeBuyables.push(ui.createStackLayout({
            children: [
                ui.createLatexLabel({
                    horizontalOptions: LayoutOptions.START,
                    textAlignment: TextAlignment.LEFT,
                    margin: new Thickness(15, 0, 15, 0),
                    textColor: Color.TEXT,
                    text: upgrade.getDescription,
                    fontSize: 20
                }),
                ui.createLabel({
                    horizontalTextAlignment: TextAlignment.LEFT,
                    fontFamily: FontFamily.CMU_REGULAR,
                    verticalTextAlignment: TextAlignment.END,
                    textColor: Color.TEXT, // TODO: Color.
                    margin: new Thickness(10, 0, 10, 4),
                    fontSize: 14,
                    text: () => {
                        return `Level: ${upgrade.level}`;
                    }
                }),
                ui.createLabel({
                    horizontalTextAlignment: TextAlignment.LEFT,
                    verticalTextAlignment: TextAlignment.END,
                    textColor: Color.TEXT,
                    margin: new Thickness(10, 5, 10, 0),
                    fontSize: 16,
                    text: () => {
                        return `(x${upgrade.cost.getMax(upgrade.level, upgrade.currency)}) ${upgrade.currency.symbol}`;
                    }
                })
            ]
        }));
    }

    return ui.createGrid({
        columnDefinitions: ["100", "100*"],
        children: [
            ui.createCheckBox({
                color: Color.TEXT,
                margin: new Thickness(0, 0, 0, 0),
                horizontalOptions: LayoutOptions.CENTER,
                translationX: 0,
                scale: 1.25,
                opacity: 0.5,
                // TODO: IsChecked="{Binding IsActive}"
                isVisible: true, // TODO: Binding IsToggleVisible
                onCheckedChanged: () => {
                    log('RequestToggleActiveCommand');
                    log('RequestToggleAllActiveCommand');
                },
                column: 0
            }),
            ui.createImage({
                source: ImageSource.REFUND,
                margin: new Thickness(5, 0, 5, 0),
                heightRequest: 36,
                isVisible: true, // TODO: Binding IsRefundVisible
                opacity: 0.5, // TODO: Binding RefundOpacity
                onTouched: () => {
                    log('RequestRefundActiveCommand');
                } // TODO: Binding RequestRefundActiveCommand
            }),
            ui.createFrame({
                backgroundColor: Color.MEDIUM_BACKGROUND,
                borderColor: Color.BORDER,
                cornerRadius: 0,
                hasShadow: false,
                padding: new Thickness(0, 0, 0, 0),
                onTouched: () => {
                    log('RequestBuyCommand');
                }, // TODO: Binding RequestBuyCommand
                column: 1,
                content: ui.createGrid({
                    children: upgradeBuyables
                })
            })
        ]
    });
};

init();