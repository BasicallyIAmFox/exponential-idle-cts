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

var upgradeGroups = [];
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
        let getDesc = (level) => `c_2=2^{${level}}`;
        let getInfo = (level) => `c_2=${getC2(level).toString(0)}`;
        c2 = theory.createUpgrade(1, currency, new FreeCost());
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }
    upgradeGroups.push([c1, c2]);

    {
        let getDesc = (level) => `v_1=${getV1(level).toString(0)}`;
        let getInfo = (level) => `v_1=${getV1(level).toString(0)}`;
        v1 = theory.createUpgrade(2, currency, new FreeCost());
        v1.getDescription = (_) => Utils.getMath(getDesc(v1.level));
        v1.getInfo = (amount) => Utils.getMathTo(getInfo(v1.level), getInfo(v1.level + amount));
    }
    {
        let getDesc = (level) => `v_2=${getV2(level).toString(0)}`;
        let getInfo = (level) => `v_2=${getV2(level).toString(0)}`;
        v2 = theory.createUpgrade(3, currency, new FreeCost());
        v2.getDescription = (_) => Utils.getMath(getDesc(v2.level));
        v2.getInfo = (amount) => Utils.getMathTo(getInfo(v2.level), getInfo(v2.level + amount));
    }
    {
        let getDesc = (level) => `v_3=2^{${level}}`;
        let getInfo = (level) => `v_3=${getV3(level).toString(0)}`;
        v3 = theory.createUpgrade(4, currency, new FreeCost());
        v3.getDescription = (_) => Utils.getMath(getDesc(v3.level));
        v3.getInfo = (amount) => Utils.getMathTo(getInfo(v3.level), getInfo(v3.level + amount));
    }
    upgradeGroups.push(v1);
    upgradeGroups.push(v2);
    upgradeGroups.push(v3);

    {
        let getDesc = (level) => `p=${getP(level).toString(0)}`;
        let getInfo = (level) => `p=${getP(level).toString(0)}`;
        p = theory.createUpgrade(5, currency, new FreeCost());
        p.getDescription = (_) => Utils.getMath(getDesc(p.level));
        p.getInfo = (amount) => Utils.getMathTo(getInfo(p.level), getInfo(p.level + amount));
    }
    upgradeGroups.push(p);

    {
        let suffix = `\\text{ K}`;
        let getDesc = (level) => `T=${getTemperature(level).toString(2)} ${suffix}`;
        let getInfo = (level) => `T=${getTemperature(level).toString(2)} ${suffix}`;
        temperature = theory.createUpgrade(6, currency, new FreeCost());
        temperature.getDescription = (_) => Utils.getMath(getDesc(temperature.level));
        temperature.getInfo = (amount) => Utils.getMathTo(getInfo(temperature.level), getInfo(temperature.level + amount));
    }
    upgradeGroups.push(temperature);

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

    let v1Var = getV1(v1.level);
    let v2Var = getV2(v2.level);
    let v3Var = getV3(v3.level);
    let pressureVar = getP(p.level);
    let temperatureVar = getTemperature(temperature.level);

    v[0] += dt * v1Var * v2Var;
    v[1] += dt * v2Var * v3Var;
    v[2] += dt * v3Var * v1Var;
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
    let result = `\\begin{matrix}`;
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
var getV1 = (level) => Utils.getStepwisePowerSum(level, 2, 6, 0);
var getV2 = (level) => Utils.getStepwisePowerSum(level, 2, 8, 0);
var getV3 = (level) => BigNumber.TWO.pow(level);
var getP = (level) => Utils.getStepwisePowerSum(level, 2, 5, 1);
var getTemperature = (level) => 5 * Utils.getStepwisePowerSum(level, 2, 10, 0);

var getUpgradeListDelegate = () => {
    const createUpgradeBuyable = (upgrade) => {
        const buyableDescription = ui.createLatexLabel({
            horizontalOptions: LayoutOptions.START,
            verticalTextAlignment: TextAlignment.CENTER,
            margin: new Thickness(15, 0, 15, 0),
            textColor: Color.TEXT,
            text: () => {
                return upgrade.getDescription(upgrade.level);
            },
            fontSize: 10
        });
        const buyableCost = ui.createLabel({
            horizontalTextAlignment: TextAlignment.END,
            fontFamily: FontFamily.CMU_REGULAR,
            verticalTextAlignment: TextAlignment.START,
            textColor: Color.TEXT,
            margin: new Thickness(15, 5, 10, 0),
            fontSize: 16,
            text: () => {
                if (theory.buyAmountUpgrades == -1) {
                    let max = Math.max(upgrade.cost.getMax(upgrade.level, upgrade.level + theory.buyAmountUpgrades), 1);
                    let cost = upgrade.cost.getSum(upgrade.level, upgrade.level + max);
                    if (cost == BigNumber.ZERO) return Localization.get("BuyablesCostFree");
                    return `(x${upgrade.cost.getMax(upgrade.level, upgrade.currency.value)}) ${cost}${upgrade.currency.symbol}`;
                } else {
                    let cost = upgrade.cost.getSum(upgrade.level, upgrade.level + theory.buyAmountUpgrades);
                    if (cost == BigNumber.ZERO) return Localization.get("BuyablesCostFree");
                    return `(x${theory.buyAmountUpgrades}) ${cost}${upgrade.currency.symbol}`;
                }
            }
        });
        const buyableLevel = ui.createLabel({
            horizontalTextAlignment: TextAlignment.END,
            fontFamily: FontFamily.CMU_REGULAR,
            verticalTextAlignment: TextAlignment.END,
            textColor: Color.TEXT_MEDIUM,
            margin: new Thickness(10, 0, 10, 4),
            fontSize: 12,
            text: () => {
                return Localization.format(Localization.get("BuyablesLevel"), upgrade.level);
            }
        });

        const deactivatedBuyableBox = ui.createGrid({
            widthRequest: 8,
            backgroundColor: Color.DEACTIVATED_UPGRADE,
            margin: new Thickness(0, 0, 0, 0),
            horizontalOptions: LayoutOptions.START,
            isVisible: () => !upgrade.isAutoBuyable
        });

        const buyableFrame = ui.createFrame({
            backgroundColor: Color.MEDIUM_BACKGROUND,
            borderColor: Color.BORDER,
            cornerRadius: 0,
            hasShadow: false,
            padding: new Thickness(0, 0, 5, 0),
            onTouched: (e) => {
                if (e.type == TouchType.SHORTPRESS_RELEASED) {
                    upgrade.buy(theory.buyAmountUpgrades);
                }
            }, // TODO: Binding RequestBuyCommand
            content: ui.createGrid({
                children: [ buyableDescription, buyableLevel, buyableCost, deactivatedBuyableBox ]
            })
        });

        return ui.createGrid({
            heightRequest: 50,
            children: [ buyableFrame ]
        });
    }

    let upgradeBuyables = [];
    for (let i = 0; i < upgradeGroups.length; i++) {
        if (upgradeGroups[i].length !== undefined) {
            const definitions = [];
            const layouts = [];
            for (let j = 0; j < upgradeGroups[i].length; j++) {
                const layout = createUpgradeBuyable(upgradeGroups[i][j]);
                layout.column = j;
                layouts.push(layout);
                definitions.push("*");
            }
            const grid = ui.createGrid({
                columnDefinitions: definitions,
                children: layouts,
                row: upgradeBuyables.length
            });
            upgradeBuyables.push(grid);
        } else {
            const grid = createUpgradeBuyable(upgradeGroups[i]);
            grid.row = upgradeBuyables.length;
            upgradeBuyables.push(grid);
        }
    }
    const buyableLayout = ui.createGrid({
        horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
        rowSpacing: 2,
        columnSpacing: 0,
        padding: new Thickness(0, 0, 0, 0),
        children: upgradeBuyables
    });

    const grid = ui.createGrid({
        rowDefinitions: ["36", "*"],
        children: [ ui.createScrollView({ content: buyableLayout, row: 1 }) ]
    });

    return grid;
};

init();