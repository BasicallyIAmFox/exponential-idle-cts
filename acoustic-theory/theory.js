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

var currency;
var t = BigNumber.ZERO;
var rhodot = BigNumber.ZERO;
var c = BigNumber.ZERO;
var v = [BigNumber.ZERO, BigNumber.ZERO, BigNumber.ZERO];
var vdot = [BigNumber.ZERO, BigNumber.ZERO, BigNumber.ZERO];
var I = [BigNumber.ZERO, BigNumber.ZERO, BigNumber.ZERO];
var I_mean = BigNumber.ZERO;

var c1, c2, v1, v2, v3, p, temperature, a;
var msMean, msTemperature;

var quaternaryEntries = [];
var stage = 1;

var init = () => {
    currency = theory.createCurrency();

    // Regular Upgrades

    {
        let getDesc = (level) => `c_1=${getC1(level).toString(0)}`;
        let getInfo = (level) => `c_1=${getC1(level).toString(0)}`;
        c1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(0.625, Math.log2(1.35))));
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
    }

    {
        let getDesc = (level) => `c_2=2^{${level}}`;
        let getInfo = (level) => `c_2=${getC2(level).toString(0)}`;
        c2 = theory.createUpgrade(1, currency, new ExponentialCost(2, 4.5));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    {
        let getDesc = (level) => `v_1=${getV1(level).toString(0)}`;
        let getInfo = (level) => `v_1=${getV1(level).toString(0)}`;
        v1 = theory.createUpgrade(2, currency, new ExponentialCost(100, Math.log2(3)));
        v1.getDescription = (_) => Utils.getMath(getDesc(v1.level));
        v1.getInfo = (amount) => Utils.getMathTo(getInfo(v1.level), getInfo(v1.level + amount));
    }

    {
        let getDesc = (level) => `v_2=${getV2(level).toString(0)}`;
        let getInfo = (level) => `v_2=${getV2(level).toString(0)}`;
        v2 = theory.createUpgrade(3, currency, new ExponentialCost(250, Math.log2(5)));
        v2.getDescription = (_) => Utils.getMath(getDesc(v2.level));
        v2.getInfo = (amount) => Utils.getMathTo(getInfo(v2.level), getInfo(v2.level + amount));
    }

    {
        let getDesc = (level) => `v_3={1.5}^{${level}}`;
        let getInfo = (level) => `v_3=${getV3(level).toString(2)}`;
        v3 = theory.createUpgrade(4, currency, new ExponentialCost(1e8, Math.log2(13)));
        v3.getDescription = (_) => Utils.getMath(getDesc(v3.level));
        v3.getInfo = (amount) => Utils.getMathTo(getInfo(v3.level), getInfo(v3.level + amount));
    }

    {
        let getDesc = (level) => `p=${getP(level).toString(0)}`;
        let getInfo = (level) => `p=${getP(level).toString(0)}`;
        p = theory.createUpgrade(5, currency, new ExponentialCost(1e6, Math.log2(1e1)));
        p.getDescription = (_) => Utils.getMath(getDesc(p.level));
        p.getInfo = (amount) => Utils.getMathTo(getInfo(p.level), getInfo(p.level + amount));
    }

    {
        let suffix = `\\text{ K}`;
        let getDesc = (level) => `T=5 \\times 2^{${level}} ${suffix}`;
        let getInfo = (level) => `T=${getTemperature(level).toString(0)} ${suffix}`;
        temperature = theory.createUpgrade(6, currency, new ExponentialCost(1e10, 15 * Math.log2(1.2)));
        temperature.getDescription = (_) => Utils.getMath(getDesc(temperature.level));
        temperature.getInfo = (amount) => Utils.getMathTo(getInfo(temperature.level), getInfo(temperature.level + amount));
        temperature.isAvailable = false;
    }

    {
        let getDesc = (level) => `a=${getA(level).toString(2)}`;
        let getInfo = (level) => `a=${getA(level).toString(2)}`;
        a = theory.createUpgrade(7, currency, new ExponentialCost(1e150, Math.log2(1e15)));
        a.getDescription = (_) => Utils.getMath(getDesc(a.level));
        a.getInfo = (amount) => Utils.getMathTo(getInfo(a.level), getInfo(a.level + amount));
        a.isAvailable = false;
    }

    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e20);

    // Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(15, 15));

    {
        msMean = theory.createMilestoneUpgrade(0, 5);
        msMean.getDescription = (_) => {
            if (msMean.level == 0) {
                return `$\\text{Aggregate } \\mathbf{I} \\text{ using geometric mean}$`;
            } else if (msMean.level == 1) {
                return `$\\text{Aggregate } \\mathbf{I} \\text{ using arithmetic mean}$`;
            } else if (msMean.level == 2) {
                return `$\\text{Aggregate } \\mathbf{I} \\text{ using root mean square}$`;
            } else if (msMean.level == 3) {
                return `$\\text{Aggregate } \\mathbf{I} \\text{ using root mean cube}$`;
            }
            return Localization.getUpgradeAddTermDesc("a");
        };
        msMean.getInfo = (_) => {
            if (msMean.level == 0) {
                return `$\\text{Change g(I) to } \\sqrt[3]{\\mathbf{I}\\hat{x} \\cdot \\mathbf{I}\\hat{y} \\cdot \\mathbf{I}\\hat{z}}$`;
            } else if (msMean.level == 1) {
                return `$\\text{Change g(I) to } \\frac{\\mathbf{I}\\hat{x} + \\mathbf{I}\\hat{y} + \\mathbf{I}\\hat{z}}{3}$`;
            } else if (msMean.level == 2) {
                return `$\\text{Change g(I) to } \\sqrt{\\frac{(\\mathbf{I}\\hat{x})^2 + (\\mathbf{I}\\hat{y})^2 + (\\mathbf{I}\\hat{z})^2}{3}}$`;
            } else if (msMean.level == 3) {
                return `$\\text{Change g(I) to } \\sqrt[3]{\\frac{(\\mathbf{I}\\hat{x})^3 + (\\mathbf{I}\\hat{y})^3 + (\\mathbf{I}\\hat{z})^3}{3}}$`;
            }
            return Localization.getUpgradeAddTermInfo("a");
        };
    }

    {
        msTemperature = theory.createMilestoneUpgrade(1, 1);
        msTemperature.getDescription = (_) => `${Localization.getUpgradeUnlockDesc("T")}; $\\uparrow C$`;
        msTemperature.getInfo = (_) => `${Localization.getUpgradeUnlockInfo("T")} \\\\ ${Localization.getUpgradeMultCustomInfo("C", "5")}`;
        msTemperature.boughtOrRefunded = (_) => updateAvailability();
    }

    // Story Chapters
    theory.createStoryChapter(0, "The Beginnings", `You are an young engineer who is intrigued by the topic of acoustics.

You had spent quite a bit of time on a special machine that can produce arbitrary sounds.

While it may not seem impressive, it will allow you to dive deeper into the topic than the books let you.

You put the machine into an isolated area to not disturb the neighbors and begin the personal research.`, () => c1.level > 0);

    updateAvailability();
};

var updateAvailability = () => {
    temperature.isAvailable = msTemperature.level > 0;
    a.isAvailable = msMean.level == 5;
};

var getInternalState = () => JSON.stringify({
    t: t.toBase64String(),
    stage: stage,
    v0: v[0].toBase64String(),
    v1: v[1].toBase64String(),
    v2: v[2].toBase64String()
});

var setInternalState = (stateStr) => {
    if(!stateStr) return;

    let state = JSON.parse(stateStr);
    t = BigNumber.fromBase64String(state.t) ?? t;
    stage = state.stage ?? stage;
    v[0] = BigNumber.fromBase64String(state.v0) ?? v[0];
    v[1] = BigNumber.fromBase64String(state.v1) ?? v[1];
    v[2] = BigNumber.fromBase64String(state.v2) ?? v[2];
};

var tick = (elapsedTime, multiplier) => {
    if (c1.level == 0) return;

    let dt = BigNumber.from(elapsedTime);
    let bonus = theory.publicationMultiplier * multiplier;

    let c1Var = getC1(c1.level);
    let c2Var = getC2(c2.level);
    let v1Var = getV1(v1.level);
    let v2Var = getV2(v2.level);
    let v3Var = getV3(v3.level);
    let pressureVar = getP(p.level);
    let temperatureVar = getTemperature(temperature.level);

    vdot[0] = v1Var * v2Var;
    vdot[1] = v2Var * v3Var;
    vdot[2] = v3Var * v1Var;
    v[0] += dt * vdot[0];
    v[1] += dt * vdot[1];
    v[2] += dt * vdot[2];
    I[0] = pressureVar * v[0];
    I[1] = pressureVar * v[1];
    I[2] = pressureVar * v[2];

    let speedOfSound = BigNumber.from(331.3196511181);
    if (msTemperature.level > 0) {
        speedOfSound *= (1 + temperatureVar / 273.15).sqrt();
    }
    c = speedOfSound;

    let aVar = -1;
    if (msMean.level == 1) aVar = 0;
    else if (msMean.level == 2) aVar = 1;
    else if (msMean.level == 3) aVar = 2;
    else if (msMean.level == 4) aVar = 3;
    else if (msMean.level == 5) aVar = getA(a.level);
    I_mean = aVar == 0 ? (I[0] * I[1] * I[2]).pow(1 / 3) : ((I[0].pow(aVar) + I[1].pow(aVar) + I[2].pow(aVar)) / 3).pow(1 / aVar);

    let C = 2e-6;
    if (msTemperature.level > 0) {
        C *= 5;
    }

    rhodot = bonus * C * c1Var * c2Var * speedOfSound * I_mean;
    currency.value += dt * rhodot;
    t += dt;

    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();
};

var postPublish = () => {
    t = BigNumber.ZERO;
    v[0] = v[1] = v[2] = BigNumber.ZERO;
};

var getPrimaryEquation = () => {
    let result = ``;
    if (stage === 0) {
        theory.primaryEquationHeight = 110;

        result += `g(\\mathbf{I}) = `;
        if (msMean.level == 0) {
            result += `3/(\\frac{1}{\\mathbf{I}\\hat{x}} + \\frac{1}{\\mathbf{I}\\hat{y}} + \\frac{1}{\\mathbf{I}\\hat{z}})`;
        } else if (msMean.level == 1) {
            result += `\\sqrt[3]{\\mathbf{I}\\hat{x} \\cdot \\mathbf{I}\\hat{y} \\cdot \\mathbf{I}\\hat{z}}`;
        } else if (msMean.level == 2) {
            result += `\\frac{\\mathbf{I}\\hat{x} + \\mathbf{I}\\hat{y} + \\mathbf{I}\\hat{z}}{3}`;
        } else if (msMean.level == 3) {
            result += `\\sqrt{\\frac{(\\mathbf{I}\\hat{x})^2 + (\\mathbf{I}\\hat{y})^2 + (\\mathbf{I}\\hat{z})^2}{3}}`;
        } else if (msMean.level == 4) {
            result += `\\sqrt[3]{\\frac{(\\mathbf{I}\\hat{x})^3 + (\\mathbf{I}\\hat{y})^3 + (\\mathbf{I}\\hat{z})^3}{3}}`;
        } else {
            result += `\\sqrt[a]{(\\mathbf{I}\\hat{x})^a + (\\mathbf{I}\\hat{y})^a + (\\mathbf{I}\\hat{z})^a}`;
        }
        result += `\\\\`;
        result += `\\begin{matrix}`;
        result += `\\dot{v_x} = v_1 v_2 ,& \\dot{v_y} = v_2 v_3 ,& \\dot{v_z} = v_3 v_1`;
        result += `\\end{matrix}`;
        result += `\\\\`;
        result += `c = 331.32`;
        if (msTemperature.level > 0) result += `\\sqrt{1 + T/273.15}`;
    } else if (stage === 1) {
        theory.primaryEquationHeight = 40;

        result += `\\dot{\\rho} = C c_1 c_2 c g(\\mathbf{I})`; 
    }
    result += ``;
    return result;
};

var getSecondaryEquation = () => {
    let result = `\\begin{matrix}`;
    if (stage == 0) {
        result += `\\mathbf{I} = p \\mathbf{v}`;
    } else if (stage == 1) {
        result += `g(\\mathbf{I}) = ${I_mean.toString(2)}`;
    }
    result += `\\end{matrix}`;
    return result;
};

var getTertiaryEquation = () => {
    let result = `\\begin{matrix}`;
    if (stage == 1) {
        result += `C = `;
        if (msTemperature.level > 0) {
            result += `1\\text{e-}5`;
        } else {
            result += `2\\text{e-}6`;
        }
        result += `,& ${theory.latexSymbol} = \\max \\rho`;
    }
    result += `\\end{matrix}`;
    return result;
};

var getQuaternaryEntries = () => {
    if (quaternaryEntries.length == 0) {
        if (stage == 0) {
            quaternaryEntries.push(new QuaternaryEntry("t", null));
            quaternaryEntries.push(new QuaternaryEntry("\\dot{v_x}", null));
            quaternaryEntries.push(new QuaternaryEntry("\\dot{v_y}", null));
            quaternaryEntries.push(new QuaternaryEntry("\\dot{v_z}", null));
        } else if (stage == 1) {
            quaternaryEntries.push(new QuaternaryEntry("\\dot{\\rho}", null));
            quaternaryEntries.push(new QuaternaryEntry("c", null));
            quaternaryEntries.push(new QuaternaryEntry("v_x", null));
            quaternaryEntries.push(new QuaternaryEntry("v_y", null));
            quaternaryEntries.push(new QuaternaryEntry("v_z", null));
        }
    }

    if (stage == 0) {
        quaternaryEntries[0].value = t.toString(2);
        quaternaryEntries[1].value = vdot[0].toString(2);
        quaternaryEntries[2].value = vdot[1].toString(2);
        quaternaryEntries[3].value = vdot[2].toString(2);
    } else if (stage == 1) {
        quaternaryEntries[0].value = rhodot.toString(2);
        quaternaryEntries[1].value = c.toString(2);
        quaternaryEntries[2].value = v[0].toString(2);
        quaternaryEntries[3].value = v[1].toString(2);
        quaternaryEntries[4].value = v[2].toString(2);
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

var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 13, 0);
var getC2 = (level) => BigNumber.TWO.pow(level);
var getV1 = (level) => Utils.getStepwisePowerSum(level, 2, 6, 1);
var getV2 = (level) => Utils.getStepwisePowerSum(level, 3, 8, 1);
var getV3 = (level) => BigNumber.from(1.5).pow(level);
var getP = (level) => Utils.getStepwisePowerSum(level, 2, 9, 1);
var getTemperature = (level) => 5 * BigNumber.TWO.pow(level);
var getA = (level) => 3 + 0.1 * level;

const pubPower = 0.1;
var getPublicationMultiplier = (tau) => tau.pow(pubPower);
var getPublicationMultiplierFormula = (symbol) => `{${symbol}}^{${pubPower}}`;
var getTau = () => currency.value;
var getCurrencyFromTau = (tau) => [ tau.max(BigNumber.ONE), currency.symbol ];
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

/*var getUpgradeListDelegate = () => {
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
            margin: new Thickness(10, 5, 10, 0),
            fontSize: 16,
            text: () => {
                let buyAmount = theory.buyAmountUpgrades;
                let actualAmount = buyAmount != -1 ? upgrade.cost.getMax(upgrade.level, upgrade.level + buyAmount) : buyAmount;
                actualAmount = Math.max(actualAmount, 1);

                let cost = upgrade.cost.getSum(upgrade.level, upgrade.level + actualAmount);
                if (cost == BigNumber.ZERO) return Localization.get("BuyablesCostFree");
                return `(x${actualAmount}) ${cost}${upgrade.currency.symbol}`;
            }
        });
        const buyableLevel = ui.createLabel({
            horizontalTextAlignment: TextAlignment.END,
            fontFamily: FontFamily.CMU_REGULAR,
            verticalTextAlignment: TextAlignment.END,
            textColor: Color.TEXT_MEDIUM,
            margin: new Thickness(10, 0, 10, 4),
            fontSize: 14,
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
    const buyableLayout = ui.createScrollView({ row: 1, content: ui.createGrid({
        horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
        rowSpacing: 2,
        columnSpacing: 0,
        padding: new Thickness(0, 0, 0, 0),
        children: upgradeBuyables
    }) });

    const header = ui.createGrid({
        row: 0,
        columnDefinitions: ["100*"],
        children: [
            ui.createGrid({
                columnDefinitions: ["50*", "50*"],
                children: [
                    ui.createStackLayout({
                        orientation: StackOrientation.HORIZONTAL,
                        padding: new Thickness(15, 0, 15, 0),
                        onTouched: (e) => {
                        },
                        children: [
                            // SwitchImage
                            ui.createImage({
                                heightRequest: 16,
                                source: ImageSource.UP_DOWN_ARROWS
                            }),
                            // BuyableTitle
                            ui.createLabel({
                                fontSize: 16,
                                widthRequest: 200,
                                heightRequest: 40,
                                verticalTextAlignment: TextAlignment.CENTER,
                                textColor: Color.TEXT,
                                horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
                                horizontalTextAlignment: TextAlignment.START,
                                text: () => Localization.get("MainPageUpgrades")
                            })
                        ],
                        column: 0
                    }),
                    // BuyableTitleCost
                    ui.createLabel({
                        fontSize: 16,
                        widthRequest: 200,
                        heightRequest: 40,
                        verticalTextAlignment: TextAlignment.CENTER,
                        textColor: Color.TEXT,
                        horizontalOptions: LayoutOptions.END,
                        horizontalTextAlignment: TextAlignment.END,
                        padding: new Thickness(10, 0, 10, 0),
                        text: () => {
                            if (theory.buyAmountUpgrades != -1) return Localization.format(Localization.get("BuyablesCostN"), theory.buyAmountUpgrades);
                            return Localization.get("BuyablesCostMax");
                        },
                        onTouched: (e) => {
                            if (e.type == TouchType.SHORTPRESS_RELEASED) {
                                if (theory.buyAmountUpgrades == 1) {
                                    theory.buyAmountUpgrades = 10;
                                } else if (theory.buyAmountUpgrades == 10) {
                                    theory.buyAmountUpgrades = 25;
                                } else if (theory.buyAmountUpgrades == 25) {
                                    theory.buyAmountUpgrades = 100;
                                } else if (theory.buyAmountUpgrades == 100) {
                                    theory.buyAmountUpgrades = -1;
                                } else if (theory.buyAmountUpgrades == -1) {
                                    theory.buyAmountUpgrades = 1;
                                }
                            }
                        },
                        column: 1
                    })
                ],
                column: 0
            }),
            // InfoLayout
            ui.createStackLayout({
                orientation: StackOrientation.HORIZONTAL,
                horizontalOptions: LayoutOptions.CENTER_AND_EXPAND,
                padding: new Thickness(0, 0, 0, 0),
                widthRequest: 60,
                opacity: 0.6,
                onTouched: (e) => {
                },
                children: [ ui.createImage({
                    horizontalOptions: LayoutOptions.CENTER_AND_EXPAND,
                    heightRequest: 20,
                    source: ImageSource.INFO
                }) ],
                column: 0
            })
        ]
    });

    const buyAllLayout = ui.createStackLayout({
        orientation: StackOrientation.HORIZONTAL,
        row: 2,
        children: [
            // AutoBuySettings
            ui.createImage({
                heightRequest: 36,
                opacity: () => 0.7,
                margin: new Thickness(5, 0, 0, 0),
                source: ImageSource.CHECKLIST,
                onTouched: (e) => {
                }
            }),
            // BuyAllButton
            ui.createButton({
                backgroundColor: Color.MEDIUM_BACKGROUND,
                borderColor: Color.BORDER,
                borderWidth: 1,
                textColor: Color.TEXT,
                horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
                fontSize: 14,
                fontAttributes: FontAttributes.BOLD,
                margin: new Thickness(0, 3, 0, 3),
                text: () => Localization.get("BuyablesBuyAll"),
                onTouched: (e) => {
                    if (e.type.isReleased()) {
                        for (let i = 0; i < theory.upgrades.length; i++) {
                            const upgrade = theory.upgrades[i];
                            if (upgrade.isAutoBuyable)
                                upgrade.buy(theory.buyAmountUpgrades);
                        }
                    }
                }
            }),
            // AutoBuyToggle
            ui.createStackLayout({
                onTouched: (e) => {
                },
                opacity: () => 0.4,
                children: [
                    // AutoBuyLabel
                    ui.createLabel({
                        textColor: Color.TEXT,
                        fontSize: 16,
                        widthRequest: 50,
                        heightRequest: 20,
                        horizontalTextAlignment: TextAlignment.CENTER,
                        verticalTextAlignment: TextAlignment.CENTER,
                        text: () => Localization.get("AutoToggleText")
                    }),
                    // AutoBuySwitch
                    ui.createSwitch({
                        onColor: Color.SWITCH_BACKGROUND,
                        thumbColor: Color.TEXT,
                        horizontalOptions: LayoutOptions.CENTER,
                        anchorY: 0,
                        scale: 1,
                        isToggled: () => false,
                        inputTransparent: true
                    })
                ]
            })
        ]
    });

    const grid = ui.createGrid({
        rowDefinitions: ["auto", "auto", "50"],
        children: [ header, buyableLayout, buyAllLayout ]
    });

    return grid;
};*/

init();