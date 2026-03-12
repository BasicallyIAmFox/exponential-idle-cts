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
var rhodot;
var a, adot;
var T, Tdot;
var c, W, f, k, D;

var c1, c2;
var a1, a2;
var T1;
var S;

var quaternaryEntries = [];
var stage = 1;

var init = () => {
    currency = theory.createCurrency();

    // Regular Upgrades

    {
        let getDesc = (level) => `c_1=${getC1(level).toString(0)}`;
        let getInfo = (level) => `c_1=${getC1(level).toString(0)}`;
        c1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(5, Math.log2(2))));
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
    }

    {
        let getDesc = (level) => `c_2=2^{${level}}`;
        let getInfo = (level) => `c_2=${getC2(level).toString(0)}`;
        c2 = theory.createUpgrade(1, currency, new ExponentialCost(1000, Math.log2(10)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    {
        let getDesc = (level) => `a_1=${getA1(level).toString(0)}`;
        let getInfo = (level) => `a_1=${getA1(level).toString(0)}`;
        a1 = theory.createUpgrade(2, currency, new ExponentialCost(4e4, Math.log2(40)));
        a1.getDescription = (_) => Utils.getMath(getDesc(a1.level));
        a1.getInfo = (amount) => Utils.getMathTo(getInfo(a1.level), getInfo(a1.level + amount));
    }

    {
        let getDesc = (level) => `a_2={0.8}^{${level}}`;
        let getInfo = (level) => `a_2=1/${getA2Reverse(level).toString(2)}`;
        a2 = theory.createUpgrade(3, currency, new ExponentialCost(1e4, Math.log2(1e4)));
        a2.getDescription = (_) => Utils.getMath(getDesc(a2.level));
        a2.getInfo = (amount) => Utils.getMathTo(getInfo(a2.level), getInfo(a2.level + amount));
    }

    {
        let getDesc = (level) => `T_1=${getT1(level).toString(0)}`;
        let getInfo = (level) => `T_1=${getT1(level).toString(0)}`;
        T1 = theory.createUpgrade(4, currency, new ExponentialCost(1e5, Math.log2(40)));
        T1.getDescription = (_) => Utils.getMath(getDesc(T1.level));
        T1.getInfo = (amount) => Utils.getMathTo(getInfo(T1.level), getInfo(T1.level + amount));
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

    // Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(15, 15));

    // Story Chapters
    theory.createStoryChapter(0, "The Beginnings", `You are an young engineer who is intrigued by the topic of acoustics.

You had spent quite a bit of time on a special machine that can produce arbitrary sounds.

While it may not seem impressive, it will allow you to dive deeper into the topic than the books let you.

You put the machine into an isolated area to not disturb the neighbors and begin the personal research.`, () => c1.level > 0);

    adot = BigNumber.ZERO;
    a = BigNumber.from(50);
    Tdot = BigNumber.ZERO;
    T = BigNumber.ZERO;

    updateAvailability();
};

var updateAvailability = () => {
};

var getInternalState = () => JSON.stringify({
    a: a.toBase64String(),
    T: T.toBase64String()
});

var setInternalState = (stateStr) => {
    if(!stateStr) return;

    let state = JSON.parse(stateStr);
    a = if (state.a) BigNumber.fromBase64String(state.a) ?? a else a;
    T = if (state.T) BigNumber.fromBase64String(state.T) ?? T else T;
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
    let I = vp1 * vp1 / (a * c);
    W = I * vs;
    D = 10;
    f = 1.84 * c / (Math.PI * D);
    k = 2 * Math.PI * f / c;

    adot = va1 * (40 - a * va2);
    a += dt * adot;

    Tdot = vT1 * vT1 * (T.sqrt() / 10).log2();
    T += dt * Tdot;

    rhodot = bonus * W * c * vc1 * vc2 * k;
    currency.value += dt * rhodot;

    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();
};

var postPublish = () => {
    a = BigNumber.from(50);
    T = BigNumber.ZERO;
};

var getPrimaryEquation = () => {
    let result = ``;
    if (stage === 0) {
        result += `W = I S`;
        result += `\\\\`;
        result += `I = \\frac{p^2}{a c}`;
    } else if (stage === 1) {
        result += `\\dot{\\rho} = W c c_1 c_2 k`;
        result += `\\\\`;
        result += `\\dot{a} = a_1 (40 - \\frac{a}{a_2})`;
        result += `\\\\`;
        result += `\\dot{T} = T_1^2 \\log_2(\\frac{\\sqrt{T}}{10})`;
    }
    result += ``;
    return result;
};

var getSecondaryEquation = () => {
    let result = `\\begin{matrix}`;
    if (stage == 0) {
        result += `f = \\frac{1.84 c}{\\pi D}`;
        result += `\\\\`;
        result += `k = 2 \\pi \\frac{f}{c}`;
    } else if (stage == 1) {
        result += `c = 331.32 + 0.6 T`;
    }
    result += `\\end{matrix}`;
    return result;
};

var getTertiaryEquation = () => {
    let result = `\\begin{matrix}`;
    if (stage == 1) {
        result += `${theory.latexSymbol} = \\max \\rho`;
    }
    result += `\\end{matrix}`;
    return result;
};

var getQuaternaryEntries = () => {
    if (quaternaryEntries.length == 0) {
        if (stage == 0) {
            quaternaryEntries.push(new QuaternaryEntry("f", null));
            quaternaryEntries.push(new QuaternaryEntry("D", null));
            quaternaryEntries.push(new QuaternaryEntry("k", null));
            quaternaryEntries.push(new QuaternaryEntry("\\dot{a}", null));
            quaternaryEntries.push(new QuaternaryEntry("\\dot{T}", null));
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
        quaternaryEntries[1].value = D.toString(2);
        quaternaryEntries[2].value = k.toString(2);
        quaternaryEntries[3].value = adot.toString(2);
        quaternaryEntries[4].value = Tdot.toString(2);
    } else if (stage == 1) {
        quaternaryEntries[0].value = rhodot.toString(2);
        quaternaryEntries[1].value = a.toString(2);
        quaternaryEntries[2].value = T.toString(2);
        quaternaryEntries[3].value = c.toString(2);
        quaternaryEntries[4].value = W.toString(2);
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
var getA1 = (level) => Utils.getStepwisePowerSum(level, 2, 5, 0);
var getA2Reverse = (level) => BigNumber.from(1 / 0.8).pow(level);
var getT1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getS = (level) => Utils.getStepwisePowerSum(level, 100, 100, 1);

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