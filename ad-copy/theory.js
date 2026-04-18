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

var id = "ad_clone";
var getName = (_) => {
    return `Antimatter Dimensions`;
};
var getDescription = (_) => {
    return `yet another AD clone`;
};
var authors = "e";
var version = 1;

class Currency {
    get symbol() { throw new NotImplementedError(); }

    get value() { throw new NotImplementedError(); }

    set value(value) { throw new NotImplementedError(); }

    add(amount) { this.value = value + amount; }

    subtract(amount) { this.value = value - amount; }

    multiply(amount) { this.value = value * amount; }

    divide(amount) { this.value = value / amount; }

    eq(amount) { return value == amount; }

    gt(amount) { return value == amount; }

    gte(amount) { return value == amount; }

    lt(amount) { return value == amount; }

    lte(amount) { return value == amount; }

    purchase(cost) {
        if (!this.gte(cost)) return false;
        this.subtract(cost);
        return true;
    }

    bumpTo(value) {
        this.value = this.value.max(value);
    }

    dropTo(value) {
        this.value = this.value.min(value);
    }

    get startingValue() { throw new NotImplementedError(); }

    reset() {
        this.value = this.startingValue;
    }
};
Currency.antimatter = new class extends Currency {
    _value = BigNumber.ZERO;

    get symbol() { return "AM"; }

    get value() { return this._value; };

    set value(value) {
        this._value = value;
    }

    get productionPerSecond() {
        return AntimatterDimension(1).productionPerRealSecond;
    }

    get startingValue() {
        return BigNumber.from(10);
    }
};

class DimensionState {
    constructor(getData, tier) {
        this._tier = tier;
        this._getData = getData;
        const DISPLAY_NAMES = [null, "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth"];
        this._displayName = DISPLAY_NAMES[tier];
        const SHORT_DISPLAY_NAMES = [null, "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
        this._shortDisplayName = SHORT_DISPLAY_NAMES[tier];
    }

    get tier() { return this._tier; }

    get displayName() { return this._displayName; }
    get shortDisplayName() { return this._shortDisplayName; }

    get data() { return this._getData()[this.tier - 1]; }

    /** @returns {Decimal} */
    get amount() { return this.data.amount; }
    /** @param {Decimal} value */
    set amount(value) { this.data.amount = value; }

    /** @returns {number} */
    get bought() { return this.data.bought; }
    /** @param {number} value */
    set bought(value) { this.data.bought = value; }

    /** @abstract */
    get productionPerSecond() { throw new NotImplementedError(); }

    get productionPerRealSecond() {
        return this.productionPerSecond.times(getGameSpeedupForDisplay());
    }

    productionForDt(dt) {
        return this.productionPerSecond.times(dt);
    }

    produceCurrency(currency, dt) {
        currency.add(this.productionForDt(dt));
    }

    produceDimensions(dimension, dt) {
        dimension.amount = dimension.amount.plus(this.productionForDt(dt));
    }

    static get dimensionCount() { return 8; }

    static createAccessor() {
        const index = [...Array(this.dimensionCount)].map(tier => new this(1 + tier));
        index.unshift(null);
        const accessor = tier => index[tier];
        accessor.index = index;
        return accessor;
    }
};
class AntimatterDimensionState extends DimensionState {
    constructor(tier) {
        super(() => Currency.antimatter, tier);
        const BASE_COSTS = [null, 10, 100, 1e4, 1e6, 1e9, 1e13, 1e18, 1e24];
        this._baseCost = BASE_COSTS[tier];
        const BASE_COST_MULTIPLIERS = [null, 1e3, 1e4, 1e5, 1e6, 1e8, 1e10, 1e12, 1e15];
        this._baseCostMultiplier = BASE_COST_MULTIPLIERS[tier];
        const C6_BASE_COSTS = [null, 10, 100, 100, 500, 2500, 2e4, 2e5, 4e6];
        this._c6BaseCost = C6_BASE_COSTS[tier];
        const C6_BASE_COST_MULTIPLIERS = [null, 1e3, 5e3, 1e4, 1.2e4, 1.8e4, 2.6e4, 3.2e4, 4.2e4];
        this._c6BaseCostMultiplier = C6_BASE_COST_MULTIPLIERS[tier];
    }
};
const AntimatterDimension = AntimatterDimensionState.createAccessor();
const AntimatterDimensions = {
    all: AntimatterDimension.index.slice(1, AntimatterDimensionState.dimensionCount),

    reset() {
        for (const dimension of AntimatterDimensions.all) {
            dimension.reset();
        }
    },

    resetAmountUpToTier(maxTier) {
        for (const dimension of AntimatterDimensions.all.slice(0, maxTier)) {
            dimension.reset();
        }
    },

    tick(dt) {
        let maxTierProduced = 7;
        let nextTierOffset = 1;
        for (let tier = maxTierProduced; tier >= 1; --tier) {
            AntimatterDimension(tier + nextTierOffset).produceDimensions(AntimatterDimension(tier), dt);
        }
        AntimatterDimension(1).produceCurrency(Currency.antimatter, dt);
    }
};

class TabState {
    constructor(...stages) {
        this.currentStageIndex = 0;
        this.stages = stages;
    }
};
TabState.Stage = class {
    constructor(id, availability) {
        this.id = id;
        this.availability = availability || (() => true);
    }
};

const TAB_DIMENSIONS = 0;
const TAB_AUTOMATION = 1;
const TAB_ACHIEVEMENTS = 2;
const TAB_STATISTICS = 3;
const TAB_OPTIONS = 4;
let currentTab = TAB_DIMENSIONS;
let tabStates = {
    0: (() => {
        let state = new TabState(new TabState.Stage(0),
            new TabState.Stage(1, () => false),
            new TabState.Stage(2, () => false));
        state.ui = (stageId) => {
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
                        /*let buyAmount = theory.buyAmountUpgrades;
                        let actualAmount = buyAmount != -1 ? upgrade.cost.getMax(upgrade.level, upgrade.level + buyAmount) : buyAmount;
                        actualAmount = Math.max(actualAmount, 1);

                        let cost = upgrade.cost.getSum(upgrade.level, upgrade.level + actualAmount);
                        if (cost == BigNumber.ZERO) return Localization.get("BuyablesCostFree");
                        return `(x${actualAmount}) ${cost}${upgrade.currency.symbol}`;*/
                        return `cost ${upgrade.currency.symbol}`;
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
                    isVisible: () => false
                });

                const buyableFrame = ui.createFrame({
                    backgroundColor: Color.MEDIUM_BACKGROUND,
                    borderColor: Color.BORDER,
                    cornerRadius: 0,
                    hasShadow: false,
                    padding: new Thickness(0, 0, 5, 0),
                    onTouched: (e) => {
                        if (e.type == TouchType.SHORTPRESS_RELEASED) {
                            //upgrade.buy(theory.buyAmountUpgrades);
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
            };

            const header = ui.createGrid({
                row: 0,
                columnDefinitions: ["100*"],
                children: [
                    ui.createGrid({
                        columnDefinitions: ["50*", "50*"],
                        children: [
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
            
            let upgradeBuyables = [];
            upgradeBuyables.push(createUpgradeBuyable({
                currency: Currency.antimatter,
                level: 0,
                getDescription: (level) => {
                    return `${AntimatterDimension(1).displayName}`;
                }
            }));

            const buyableLayout = ui.createScrollView({ row: 1, content: ui.createGrid({
                horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
                rowSpacing: 2,
                columnSpacing: 0,
                padding: new Thickness(0, 0, 0, 0),
                children: upgradeBuyables
            }) });

            const grid = ui.createGrid({
                rowDefinitions: ["auto", "auto", "50"],
                children: [ header, buyableLayout ]
            });

            return grid;
        };

        return state;
    })(),
    1: new TabState(
        new TabState.Stage(0)
    ),
    2: new TabState(
        new TabState.Stage(0),
        new TabState.Stage(1)
    ),
    3: new TabState(
        new TabState.Stage(0)
    ),
    4: new TabState(
        new TabState.Stage(0)
    )
};

var canGoToPreviousStage = () => {
    let i = tabStates[currentTab].currentStageIndex - 1;
    while (i >= 0 && !tabStates[currentTab].stages[i].availability()) {
        i--;
    }
    return i >= 0;
};
var goToPreviousStage = () => {
    let i = tabStates[currentTab].currentStageIndex - 1;
    while (i >= 0 && !tabStates[currentTab].stages[i].availability()) {
        i--;
    }
    tabStates[currentTab].currentStageIndex = i;
    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    quaternaryEntries = [];
    theory.invalidateQuaternaryValues();
};
var canGoToNextStage = () => {
    let i = tabStates[currentTab].currentStageIndex + 1;
    while (i < tabStates[currentTab].stages.length && !tabStates[currentTab].stages[i].availability()) {
        i++;
    }
    return i < tabStates[currentTab].stages.length;
};
var goToNextStage = () => {
    let i = tabStates[currentTab].currentStageIndex + 1;
    while (i < tabStates[currentTab].stages.length && !tabStates[currentTab].stages[i].availability()) {
        i++;
    }
    tabStates[currentTab].currentStageIndex = i;
    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    quaternaryEntries = [];
    theory.invalidateQuaternaryValues();
};

var init = () => {
};

function switchTab(newTab) {
    currentTab = newTab;
}

var tick = (elapsedTime, _) => {
};

var getCurrencyBarDelegate = () => {
    function createButton(id, text) {
        const highlight = ui.createBox({
            heightRequest: 5,
            horizontalOptions: LayoutOptions.CENTER_AND_EXPAND,
            opacity: () => (currentTab === id) ? 1 : 0
        });

        let label = ui.createLatexLabel({
            fontSize: 11,
            horizontalOptions: LayoutOptions.CENTER_AND_EXPAND,
            text: text
        });

        return ui.createStackLayout({
            margin: new Thickness(0, 3, 0, 0),
            horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
            children: [label, highlight],
            onTouched: (_) => switchTab(id),
            isVisible: () => isVisibleById(id)
        });
    }

    function isVisibleById(id) {
        if (id === TAB_AUTOMATION) return false;
        return true;
    }

    return ui.createFrame({
        content: ui.createGrid({
            margin: new Thickness(0, 3, 0, 0),
            rowDefinitions: ["auto", "auto"],
            children: [
                ui.createStackLayout({
                    row: 0,
                    horizontalOptions: LayoutOptions.FILL_AND_EXPAND,
                    orientation: StackOrientation.HORIZONTAL,
                    children: [
                        createButton(TAB_DIMENSIONS, "D"),
                        createButton(TAB_AUTOMATION, "A"),
                        createButton(TAB_ACHIEVEMENTS, "A"),
                        createButton(TAB_STATISTICS, "S"),
                        createButton(TAB_OPTIONS, "O"),
                    ]
                })
            ]
        })
    });
};

var getUpgradeListDelegate = () => {
    return tabStates[0].ui();
};

init();