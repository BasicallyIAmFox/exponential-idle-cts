var id = "kaleidoscope_ct";
var getName = (_) => {
    return `Kaleidoscope Mirror`;
};
var getDescription = (_) => {
    return `Soon:tm:`;
};
var authors = "BasicallyIAmFox";
var version = 1;

var currency;
var q_x = BigNumber.ZERO;
var q_y = BigNumber.ZERO;
var g_q = BigNumber.ZERO;
var r = BigNumber.ZERO;
var prime_count_n = BigNumber.ZERO;

const Q_MODE_RHO = 0;
const Q_MODE_R = 1;
var q_mode = Q_MODE_RHO;
var qModeSelected = -1;
var qModeNames = [`$\\rho$`, `$r$`];

var c1;
var c2;
var q1;
var r1;
var n;

var qManipulatorMs;

var graph3DSystem = {
    w: (n) => 1,
    h: (n) => 1,

    state: new Vector3(0, 0, 0),
    stateTranslation: new Vector3(0, 0, 0),
    t: 0,

    triangleIndex: 0,
    triangleProgress: 0,

    clampN: (nValue) => {
        return Math.max(nValue, 2);
    },

    update: (elapsedTime) => {
        let vn = graph3DSystem.clampN(getN(n.level));
        let alpha = Math.PI / vn;

        let width = graph3DSystem.w(vn);
        let height = graph3DSystem.h(vn);

        // TODO: add radius increase as r increases, like in EF when buying a ton of R or I upgrades
        let scale = 7.5;
        let kaleidoscopeRadius = (width ** 2 + height ** 2) ** 0.5;
        let lerp = (a, b, t) => {
            return a + t * (b - a);
        };

        let triangleIndex = graph3DSystem.triangleIndex % vn;
        let triangleSlantSideLength = kaleidoscopeRadius / Math.cos(alpha);
        let triangleEndPoints = [
            [triangleSlantSideLength * Math.cos(2 * triangleIndex * alpha + Math.PI / vn), triangleSlantSideLength * Math.sin(2 * triangleIndex * alpha + Math.PI / vn)],
            [triangleSlantSideLength * Math.cos(2 * triangleIndex * alpha - Math.PI / vn), triangleSlantSideLength * Math.sin(2 * triangleIndex * alpha - Math.PI / vn)],
        ];

        graph3DSystem.triangleProgress += elapsedTime * Math.min(vn ** 0.1, 8);
        if (graph3DSystem.triangleProgress < 1) {
            graph3DSystem.state.x = lerp(0, triangleEndPoints[0][0], graph3DSystem.triangleProgress);
            graph3DSystem.state.y = lerp(0, triangleEndPoints[0][1], graph3DSystem.triangleProgress);
        } else if (graph3DSystem.triangleProgress < 2) {
            graph3DSystem.state.x = lerp(triangleEndPoints[0][0], triangleEndPoints[1][0], graph3DSystem.triangleProgress - 1);
            graph3DSystem.state.y = lerp(triangleEndPoints[0][1], triangleEndPoints[1][1], graph3DSystem.triangleProgress - 1);
        } else if (graph3DSystem.triangleProgress < 3) {
            graph3DSystem.state.x = lerp(triangleEndPoints[1][0], 0, graph3DSystem.triangleProgress - 2);
            graph3DSystem.state.y = lerp(triangleEndPoints[1][1], 0, graph3DSystem.triangleProgress - 2);
        }
        graph3DSystem.state.x /= scale;
        graph3DSystem.state.y /= scale;
        graph3DSystem.state.z = graph3DSystem.t / scale;
        
        graph3DSystem.stateTranslation.x = 0.0;
        graph3DSystem.stateTranslation.y = 0.0;
        graph3DSystem.stateTranslation.z = -graph3DSystem.t / scale;

        graph3DSystem.t += elapsedTime;
        if (graph3DSystem.triangleProgress >= 3) {
            graph3DSystem.triangleIndex = (graph3DSystem.triangleIndex + 1) % vn;
            graph3DSystem.triangleProgress = 0;
        }
    },

    clear: () => {
        theory.clearGraph();
        graph3DSystem.t = 0;
    },

    onBuyN: () => {
    },
};

// Adapted some of UI code from MF and RZ, as well as my own additions.
let getImageSize = (width) => {
    if (width >= 1080) return 48;
    if (width >= 720) return 36;
    if (width >= 360) return 24;
    return 20;
};
const qModeImage = game.settings.theme == Theme.LIGHT
    ? ImageSource.fromUri('https://github.com/BasicallyIAmFox/exponential-idle-cts/blob/main/assets/QModeDark.png?raw=true')
    : ImageSource.fromUri('https://github.com/BasicallyIAmFox/exponential-idle-cts/blob/main/assets/QModeLight.png?raw=true');
var qModeNoneSelectedPopup = ui.createPopup({
    title: "No q-Mode selected!",
    content: ui.createLatexLabel({
        text: "Please select a valid q-Mode before swapping!",
        padding: Thickness(12, 2, 12, 2),
        horizontalTextAlignment: TextAlignment.CENTER,
        verticalTextAlignment: TextAlignment.CENTER,
    })
});
var createQModeFrame = () => {
    let isAvailable = () => qManipulatorMs.level > 0;

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
            source: qModeImage,
            aspect: Aspect.ASPECT_FIT,
            useTint: false
        }),
        borderColor,
    });
    frame.onTouched = (e) => {
        if (e.type == TouchType.PRESSED) {
            frame.borderColor = Color.TRANSPARENT;
        } else if (e.type.isReleased()) {
            frame.borderColor = borderColor;
            if (triggerable && isAvailable()) {
                Sound.playClick();
                createQModeMenu().show();
            } else {
                triggerable = true;
            }
        } else if (e.type == TouchType.MOVED && (e.x < 0 || e.y < 0 || e.x > frame.width || e.y > frame.height)) {
            frame.borderColor = borderColor;
            triggerable = false;
        }
    };
    return frame;
};
var createQModeMenu = () => {
    let createModeBtn = (params, name, info, callback) => {
        let triggerable = true;
        let frame = ui.createFrame({
            row: 0, column: 0,
            padding: new Thickness(20, 10, 20, 10),
            horizontalOptions: LayoutOptions.CENTER,
            verticalOptions: LayoutOptions.CENTER,
            content: ui.createLatexLabel({
                text: name,
                heightRequest: 20,
                horizontalTextAlignment: TextAlignment.CENTER,
                verticalTextAlignment: TextAlignment.CENTER,
            }),
        });
        frame.onTouched = (e) => {
            if (e.type == TouchType.PRESSED) {
                frame.borderColor = Color.TRANSPARENT;
            } else if (e.type.isReleased()) {
                frame.borderColor = Color.BORDER;
                if (triggerable) {
                    Sound.playClick();
                    callback();
                } else {
                    triggerable = true;
                }
            } else if (e.type == TouchType.MOVED && (e.x < 0 || e.y < 0 || e.x > frame.width || e.y > frame.height)) {
                frame.borderColor = Color.BORDER;
                triggerable = false;
            }
        };

        return ui.createFrame({
            backgroundColor: Color.TRANSPARENT,
            borderColor: Color.TRANSPARENT,
            padding: new Thickness(0, 4, 0, 4),
            content: ui.createGrid({
                columnDefinitions: ['100', 'auto', '*'],
                children: [
                    frame,
                    ui.createLabel({
                        row: 0, column: 1,
                        text: ':',
                        verticalTextAlignment: TextAlignment.CENTER,
                    }),
                    ui.createLatexLabel({
                        row: 0, column: 2,
                        text: info,
                        horizontalTextAlignment: TextAlignment.START,
                    }),
                ]
            }),
            ...params
        });
    };

    let rhoModeBtn = createModeBtn({ }, `$\\rho$ Mode`, `Sets $\\mathbf{p}$ to $${getPEquation(Q_MODE_RHO)}$.
Moves the $G(q_x, q_y)$ term to $\\dot{\\rho}$ equation.
Changes $f(x)$ definition to $1+x+x^2$.`, () => {
    qModeSelected = Q_MODE_RHO;
});

    let rModeBtn = createModeBtn({ }, `$r$ Mode`, `Sets $\\mathbf{p}$ to $${getPEquation(Q_MODE_R)}$.
Moves the $G(q_x, q_y)$ term to $\\dot{r}$ equation.
Changes $f(x)$ definition to $${getFxEquation(Q_MODE_R)}$.`, () => {
    qModeSelected = Q_MODE_R;
});

    let menu = ui.createPopup({
        isPeekable: true,
        title: `q Manipulator`,
        content: ui.createStackLayout({
            children: [
                ui.createLatexLabel({
                    margin: new Thickness(0, 0, 0, 6),
                    text: `Change the attraction point ($\\mathbf{p}$) to benefit other variables in the system.`,
                    horizontalTextAlignment: TextAlignment.CENTER,
                    verticalTextAlignment: TextAlignment.CENTER,
                }),
                ui.createLatexLabel({
                    margin: new Thickness(0, 0, 0, 6),
                    text: `Changing $\\mathbf{p}$ does not penalize in any way, but it does affect $\\dot{q}$!`,
                    horizontalTextAlignment: TextAlignment.CENTER,
                    verticalTextAlignment: TextAlignment.CENTER,
                }),

                ui.createBox({
                    heightRequest: 1,
                    margin: new Thickness(0, 0, 0, 2),
                }),

                ui.createScrollView({
                    orientation: ScrollOrientation.VERTICAL,
                    content: ui.createStackLayout({
                        orientation: StackOrientation.VERTICAL,
                        children: [
                            rhoModeBtn,
                            ui.createBox({ heightRequest: 1, margin: new Thickness(10, 0, 10, 0), }),
                            rModeBtn,
                        ]
                    })
                }),

                ui.createBox({
                    heightRequest: 1,
                    margin: new Thickness(0, 0, 0, 2),
                }),

                ui.createGrid({
                    rowDefinitions: ['20', '20'],
                    columnDefinitions: ['auto', '*'],
                    margin: new Thickness(0, 4, 0, 0),
                    children: [
                        ui.createLatexLabel({
                            row: 0, column: 0,
                            text: `Current mode:`,
                            horizontalTextAlignment: TextAlignment.START,
                            verticalTextAlignment: TextAlignment.CENTER,
                        }),
                        ui.createLatexLabel({
                            row: 0, column: 1,
                            text: () => qModeNames[q_mode],
                            horizontalTextAlignment: TextAlignment.START,
                            verticalTextAlignment: TextAlignment.CENTER,
                        }),
                        ui.createLatexLabel({
                            row: 1, column: 0,
                            text: `Next mode:`,
                            horizontalTextAlignment: TextAlignment.START,
                            verticalTextAlignment: TextAlignment.CENTER,
                        }),
                        ui.createBox({
                            row: 1, column: 1,
                            heightRequest: 1,
                            isVisible: () => qModeSelected < 0,
                        }),
                        ui.createLatexLabel({
                            row: 1, column: 1,
                            text: () => qModeNames[qModeSelected],
                            isVisible: () => qModeSelected >= 0,
                        }),
                    ]
                }),
                ui.createButton({
                    text: `Swap!`,
                    margin: new Thickness(0, 10, 0, 0),
                    padding: new Thickness(50, 0, 50, 0),
                    horizontalOptions: LayoutOptions.CENTER,
                    verticalOptions: LayoutOptions.CENTER,
                    onReleased: () => {
                        if (qModeSelected === -1) {
                            qModeNoneSelectedPopup.show();
                            return;
                        }
                        q_mode = qModeSelected;
                        qModeSelected = -1;

                        theory.invalidatePrimaryEquation();
                        theory.invalidateSecondaryEquation();
                        theory.invalidateTertiaryEquation();
                        theory.invalidateQuaternaryValues();
                    }
                }),
            ]
        }),
        onDisappearing: () => {
            qModeSelected = -1;
        },
    });
    
    return menu;
};

let qModeFrame;

var init = () => {
    currency = theory.createCurrency();

    ///////////////////
    // Regular Upgrades

    // c1
    {
        let getDesc = (level) => `c_1=${getC1(level).toString(0)}`;
        let getInfo = (level) => `c_1=${getC1(level).toString(0)}`;
        c1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(10, Math.log2(2))));
        c1.getDescription = (amount) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
    }

    // c2
    {
        let getDesc = (level) => `c_2=2^{${level}}`;
        let getInfo = (level) => `c_2=${getC2(level).toString(0)}`;
        c2 = theory.createUpgrade(1, currency, new ExponentialCost(20, Math.log2(115)));
        c2.getDescription = (amount) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    // q1
    {
        let getDesc = (level) => `q_1=${getQ1(level).toString(0)}`;
        let getInfo = (level) => `q_1=${getQ1(level).toString(0)}`;
        q1 = theory.createUpgrade(2, currency, new ExponentialCost(40, Math.log2(80)));
        q1.getDescription = (amount) => Utils.getMath(getDesc(q1.level));
        q1.getInfo = (amount) => Utils.getMathTo(getInfo(q1.level), getInfo(q1.level + amount));
    }

    // r1
    {
        let getDesc = (level) => `r_1={1.4}^{${level}}`;
        let getInfo = (level) => `r_1=${getR1(level).toString(2)}`;
        r1 = theory.createUpgrade(3, currency, new ExponentialCost(50, Math.log2(16.2)));
        r1.getDescription = (amount) => Utils.getMath(getDesc(r1.level));
        r1.getInfo = (amount) => Utils.getMathTo(getInfo(r1.level), getInfo(r1.level + amount));
    }

    // n
    {
        let getDesc = (level) => `n=${getN(level)}`;
        let getInfo = (level) => `n=${getN(level)}`;
        n = theory.createUpgrade(4, currency, new ExponentialCost(1200, Math.log2(11000)));
        n.getDescription = (amount) => Utils.getMath(getDesc(n.level));
        n.getInfo = (amount) => Utils.getMathTo(getInfo(n.level), getInfo(n.level + amount));
        n.boughtOrRefunded = (_) => graph3DSystem.onBuyN();
    }

    ///////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e6);
    theory.createBuyAllUpgrade(1, currency, 1e10);
    theory.createAutoBuyerUpgrade(2, currency, 1e20);

    /////////////////////
    // Checkpoint Upgrades
    theory.setMilestoneCost(new CustomCost(total => {
        const costs = [8];

        return BigNumber.from(costs[Math.min(costs.length - 1, total)] * 0.4);
    }));

    {
        qManipulatorMs = theory.createMilestoneUpgrade(0, 1);
        qManipulatorMs.description = `Unlock the ${Utils.getMath(`\\mathbf{q}`)} Manipulator; ${Utils.getMath(qModeNames[Q_MODE_R])} mode`;
        qManipulatorMs.info = `Unlocks the ${Utils.getMath(`\\mathbf{q}`)} Manipulator\\\\Unlocks ${Utils.getMath(qModeNames[Q_MODE_R])} mode`;
        qManipulatorMs.canBeRefunded = (_) => true;
        qManipulatorMs.boughtOrRefunded = (_) => updateAvailability();
    }

    qModeFrame = createQModeFrame();
    updateAvailability();
};

var updateAvailability = () => {
    qModeFrame.isVisible = qManipulatorMs.level > 0;
};

var getInternalState = () => JSON.stringify({
    q_x: q_x.toBase64String(),
    q_y: q_y.toBase64String(),
    r: r.toBase64String(),
    q_mode: q_mode,
});

var setInternalState = (stateStr) => {
    if (!stateStr) return;

    let state = JSON.parse(stateStr);
    q_x = BigNumber.fromBase64String(state.q_x);
    q_y = BigNumber.fromBase64String(state.q_y);
    r = BigNumber.fromBase64String(state.r);
    q_mode = parseInt(state.q_mode);
};

var gamma = (z) => {
    // https://github.com/qubyte/gamma.js/blob/main/index.js
    const g = 7;
    const p = [
        0.99999999999980993,
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7
    ];

    const g_ln = 607/128;
    const p_ln = [
        0.99999999999999709182,
        57.156235665862923517,
        -59.597960355475491248,
        14.136097974741747174,
        -0.49191381609762019978,
        0.33994649984811888699e-4,
        0.46523628927048575665e-4,
        -0.98374475304879564677e-4,
        0.15808870322491248884e-3,
        -0.21026444172410488319e-3,
        0.21743961811521264320e-3,
        -0.16431810653676389022e-3,
        0.84418223983852743293e-4,
        -0.26190838401581408670e-4,
        0.36899182659531622704e-5
    ];

    // Spouge approximation (suitable for large arguments)
    function lngamma(z) {
        if (z < 0) return Number('0/0');

        var x = p_ln[0];
        for (var i = p_ln.length - 1; i > 0; --i) {
            x += p_ln[i] / (z + i);
        }

        var t = z + g_ln + 0.5;
        return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x)-Math.log(z);
    }

    if (z < 0.5) {
        return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    } else if (z > 100) {
        return Math.exp(lngamma(z));
    } else {
        z -= 1;

        var x = p[0];
        for (var i = 1; i < g + 2; i++) {
            x += p[i] / (z + i);
        }

        var t = z + g + 0.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
    }
};

let primes = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
    73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173,
    179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281,
    283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409,
    419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541,
    547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659,
    661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809,
    811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941,
    947, 953, 967, 971, 977, 983, 991, 997, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069,
    1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1151, 1153, 1163, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223,
    1229, 1231, 1237, 1249, 1259, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1361, 1367, 1373,
    1381, 1399, 1409, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1511,
    1523, 1531, 1543, 1549, 1553, 1559, 1567, 1571, 1579, 1583, 1597, 1601, 1607, 1609, 1613, 1619, 1621, 1627, 1637, 1657,
    1663, 1667, 1669, 1693, 1697, 1699, 1709, 1721, 1723, 1733, 1741, 1747, 1753, 1759, 1777, 1783, 1787, 1789, 1801, 1811,
    1823, 1831, 1847, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1901, 1907, 1913, 1931, 1933, 1949, 1951, 1973, 1979, 1987,
    1993, 1997, 1999, 2003, 2011, 2017, 2027, 2029, 2039, 2053, 2063, 2069, 2081, 2083, 2087, 2089, 2099, 2111, 2113, 2129,
    2131, 2137, 2141, 2143, 2153, 2161, 2179, 2203, 2207, 2213, 2221, 2237, 2239, 2243, 2251, 2267, 2269, 2273, 2281, 2287,
    2293, 2297, 2309, 2311, 2333, 2339, 2341, 2347, 2351, 2357, 2371, 2377, 2381, 2383, 2389, 2393, 2399, 2411, 2417, 2423,
    2437, 2441, 2447, 2459, 2467, 2473, 2477, 2503, 2521, 2531, 2539, 2543, 2549, 2551, 2557, 2579, 2591, 2593, 2609, 2617,
    2621, 2633, 2647, 2657, 2659, 2663, 2671, 2677, 2683, 2687, 2689, 2693, 2699, 2707, 2711, 2713, 2719, 2729, 2731, 2741,
    2749, 2753, 2767, 2777, 2789, 2791, 2797, 2801, 2803, 2819, 2833, 2837, 2843, 2851, 2857, 2861, 2879, 2887, 2897, 2903,
    2909, 2917, 2927, 2939, 2953, 2957, 2963, 2969, 2971, 2999, 3001, 3011, 3019, 3023, 3037, 3041, 3049, 3061, 3067, 3079,
    3083, 3089, 3109, 3119, 3121, 3137, 3163, 3167, 3169, 3181, 3187, 3191, 3203, 3209, 3217, 3221, 3229, 3251, 3253, 3257,
    3259, 3271, 3299, 3301, 3307, 3313, 3319, 3323, 3329, 3331, 3343, 3347, 3359, 3361, 3371, 3373, 3389, 3391, 3407, 3413,
    3433, 3449, 3457, 3461, 3463, 3467, 3469, 3491, 3499, 3511, 3517, 3527, 3529, 3533, 3539, 3541, 3547, 3557, 3559, 3571,
    3581, 3583, 3593, 3607, 3613, 3617, 3623, 3631, 3637, 3643, 3659, 3671, 3673, 3677, 3691, 3697, 3701, 3709, 3719, 3727,
    3733, 3739, 3761, 3767, 3769, 3779, 3793, 3797, 3803, 3821, 3823, 3833, 3847, 3851, 3853, 3863, 3877, 3881, 3889, 3907,
    3911, 3917, 3919, 3923, 3929, 3931, 3943, 3947, 3967, 3989, 4001, 4003, 4007, 4013, 4019, 4021, 4027, 4049, 4051, 4057,
    4073, 4079, 4091, 4093, 4099, 4111, 4127, 4129, 4133, 4139, 4153, 4157, 4159, 4177, 4201, 4211, 4217, 4219, 4229, 4231,
    4241, 4243, 4253, 4259, 4261, 4271, 4273, 4283, 4289, 4297, 4327, 4337, 4339, 4349, 4357, 4363, 4373, 4391, 4397, 4409,
    4421, 4423, 4441, 4447, 4451, 4457, 4463, 4481, 4483, 4493, 4507, 4513, 4517, 4519, 4523, 4547, 4549, 4561, 4567, 4583,
    4591, 4597, 4603, 4621, 4637, 4639, 4643, 4649, 4651, 4657, 4663, 4673, 4679, 4691, 4703, 4721, 4723, 4729, 4733, 4751,
    4759, 4783, 4787, 4789, 4793, 4799, 4801, 4813, 4817, 4831, 4861, 4871, 4877, 4889, 4903, 4909, 4919, 4931, 4933, 4937,
    4943, 4951, 4957, 4967, 4969, 4973, 4987, 4993, 4999, 5003, 5009, 5011, 5021, 5023, 5039, 5051, 5059, 5077, 5081, 5087,
    5099, 5101, 5107, 5113, 5119, 5147, 5153, 5167, 5171, 5179, 5189, 5197, 5209, 5227, 5231, 5233, 5237, 5261, 5273, 5279,
    5281, 5297, 5303, 5309, 5323, 5333, 5347, 5351, 5381, 5387, 5393, 5399, 5407, 5413, 5417, 5419, 5431, 5437, 5441, 5443,
    5449, 5471, 5477, 5479, 5483, 5501, 5503, 5507, 5519, 5521, 5527, 5531, 5557, 5563, 5569, 5573, 5581, 5591, 5623, 5639,
    5641, 5647, 5651, 5653, 5657, 5659, 5669, 5683, 5689, 5693, 5701, 5711, 5717, 5737, 5741, 5743, 5749, 5779, 5783, 5791,
    5801, 5807, 5813, 5821, 5827, 5839, 5843, 5849, 5851, 5857, 5861, 5867, 5869, 5879, 5881, 5897, 5903, 5923, 5927, 5939,
    5953, 5981, 5987, 6007, 6011, 6029, 6037, 6043, 6047, 6053, 6067, 6073, 6079, 6089, 6091, 6101, 6113, 6121, 6131, 6133,
    6143, 6151, 6163, 6173, 6197, 6199, 6203, 6211, 6217, 6221, 6229, 6247, 6257, 6263, 6269, 6271, 6277, 6287, 6299, 6301,
    6311, 6317, 6323, 6329, 6337, 6343, 6353, 6359, 6361, 6367, 6373, 6379, 6389, 6397, 6421, 6427, 6449, 6451, 6469, 6473,
    6481, 6491, 6521, 6529, 6547, 6551, 6553, 6563, 6569, 6571, 6577, 6581, 6599, 6607, 6619, 6637, 6653, 6659, 6661, 6673,
    6679, 6689, 6691, 6701, 6703, 6709, 6719, 6733, 6737, 6761, 6763, 6779, 6781, 6791, 6793, 6803, 6823, 6827, 6829, 6833,
    6841, 6857, 6863, 6869, 6871, 6883, 6899, 6907, 6911, 6917, 6947, 6949, 6959, 6961, 6967, 6971, 6977, 6983, 6991, 6997,
    7001, 7013, 7019, 7027, 7039, 7043, 7057, 7069, 7079, 7103, 7109, 7121, 7127, 7129, 7151, 7159, 7177, 7187, 7193, 7207,
    7211, 7213, 7219, 7229, 7237, 7243, 7247, 7253, 7283, 7297, 7307, 7309, 7321, 7331, 7333, 7349, 7351, 7369, 7393, 7411,
    7417, 7433, 7451, 7457, 7459, 7477, 7481, 7487, 7489, 7499, 7507, 7517, 7523, 7529, 7537, 7541, 7547, 7549, 7559, 7561,
    7573, 7577, 7583, 7589, 7591, 7603, 7607, 7621, 7639, 7643, 7649, 7669, 7673, 7681, 7687, 7691, 7699, 7703, 7717, 7723,
    7727, 7741, 7753, 7757, 7759, 7789, 7793, 7817, 7823, 7829, 7841, 7853, 7867, 7873, 7877, 7879, 7883, 7901, 7907, 7919,
];
var prime_count = (n) => {
    if (n >= primes[primes.length - 1]) {
        let result = 0;
        let log_n = Math.log(n);
        for (let k = 0, upper_bound = Math.round(log_n); k <= upper_bound; k++) {
            result += gamma(k + 1) / log_n ** (1 + k);
        }
        result *= n;

        // Correction terms.
        if (n >= 71) result += 1;
        if (n >= 119) result += 1;
        if (n >= 210 && n < 317 || n >= 553) result += 1;

        return Math.floor(result);
    } else {
        let left = 0;
        let right = primes.length - 1;
        let result = 0;
        while (left <= right) {
            let mid = Math.floor((left + right) / 2);
            if (primes[mid] <= n) {
                result = mid + 1;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return result;
    }
};

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;

    let vc1 = getC1(c1.level);
    let vc2 = getC2(c2.level);
    let vq1 = getQ1(q1.level);
    let vr1 = getR1(r1.level);
    let vn = getN(n.level);
    prime_count_n = BigNumber.from(prime_count(vn));

    let f_x = (x) => {
        if (q_mode === Q_MODE_RHO)
            return 1 + x + x ** 2;
        else if (q_mode === Q_MODE_R)
            return 1 / (Math.sqrt(x) + 10 ** -2);
        else
            return 0;
    };
    let g_x = (x, y) => {
        if (x == 0.0 && y == 0.0) return f_x(0.0);
        let distance = (x ** 2 + y ** 2) ** 0.5;
        let theta = Math.atan2(y, x);
        theta = alpha - Math.abs(theta % (2 * alpha) - alpha);
        return f_x(distance * theta / (r * alpha));
    };

    let alpha = Math.PI / vn;
    {
        let q_speed = vq1 / 600;
        let q_spiral = getBetaValue();
        let q_epsilon = 10 ** -2; // Must avoid division by zero at all costs. Technically doesn't even matter...

        let target_x = 0;
        let target_y = 0;
        if (q_mode === Q_MODE_RHO) {
            target_x = r ** 2 * Math.cos(alpha);
            target_y = r ** 2 * Math.sin(alpha);
        } else if (q_mode === Q_MODE_R) {
            target_x = 0;
            target_y = 0;
        }

        // TODO: Pick a target point closest from the current point rather than heading towards the same point each time. at least for rho mode...
        let target_distances = [
            ((target_x - q_x) ** 2 + (target_y - q_y) ** 2) ** 0.5,
            ((-target_x - q_x) ** 2 + (target_y - q_y) ** 2) ** 0.5,
            ((-target_x - q_x) ** 2 + (-target_y - q_y) ** 2) ** 0.5,
            ((target_x - q_x) ** 2 + (-target_y - q_y) ** 2) ** 0.5,
        ];
        let target_distance = Math.min(...target_distances);

        let chosen_index = target_distances.indexOf(target_distance);
        if (chosen_index === 1 || chosen_index === 2) { target_x = -target_x; }
        if (chosen_index === 3 || chosen_index === 2) { target_y = -target_y; }
        
        let dq_x = ((target_x - q_x) - q_spiral * (target_y - q_y)) / (target_distance + q_epsilon);
        let dq_y = ((target_y - q_y) + q_spiral * (target_x - q_x)) / (target_distance + q_epsilon);

        let scale_x = 1 - BigNumber.E.pow(-dt * q_speed * dq_x.abs());
        let scale_y = 1 - BigNumber.E.pow(-dt * q_speed * dq_y.abs());
        q_x += Math.sign(dq_x) * scale_x * (target_x - q_x).abs();
        q_y += Math.sign(dq_y) * scale_y * (target_y - q_y).abs();

        // Clamp within bounds.
        /*let q_magnitude = (q_x ** 2 + q_y ** 2) ** 0.5;
        if (q_magnitude > r) {
            q_x *= r / q_magnitude;
            q_y *= r / q_magnitude;
        }*/
    }

    g_q = BigNumber.from(g_x(q_x, q_y)).max(BigNumber.ZERO);
    if (q_mode === Q_MODE_RHO) {
        g_q = g_q.min(f_x(r ** 2));
    }

    {
        let r_speed = vr1 / 10;
        if (q_mode === Q_MODE_R) r_speed *= g_q;
        r = (r ** 2 + 2 * r_speed * dt).sqrt();
    }
    
    {
        let rhodot = vc1 * vc2 * prime_count_n;
        if (q_mode === Q_MODE_RHO) rhodot *= g_q;
        currency.value += dt * rhodot;
    }

    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();

    graph3DSystem.update(elapsedTime);
};

var postPublish = () => {
    q_x = BigNumber.ZERO;
    q_y = BigNumber.ZERO;
    r = BigNumber.ZERO;
    q_mode = Q_MODE_RHO;

    graph3DSystem.clear();
    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();
};

var getPrimaryEquation = () => {
    theory.primaryEquationHeight = 100;
    theory.primaryEquationScale = 0.9;

    let rhodotFormula = `c_1 c_2 `;
    if (q_mode === Q_MODE_RHO) rhodotFormula += `G(q_x, q_y) `;
    rhodotFormula += `\\times \\pi(n)`;

    let rdotFormula = `r_1 `;
    if (q_mode === Q_MODE_R) rdotFormula += `G(q_x, q_y) `;
    rdotFormula += `/ {10 r}`;

    return `\\begin{array}{c}
\\dot{\\rho} = ${rhodotFormula} \\\\
\\dot{\\mathbf{q}} = \\frac{q_1}{600} \\times \\frac{(\\mathbf{p} - \\mathbf{q}) + \\beta (\\mathbf{p} - \\mathbf{q})^{\\perp}}{|\\mathbf{p} - \\mathbf{q}| + 10^{-2}} \\\\
\\dot{r} = ${rdotFormula} \\\\
\\end{array}`;
};

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 40;
    theory.secondaryEquationScale = 0.99;

    return `\\begin{matrix}
G(x, y) = f(\\sqrt{x^2 + y^2} [ \\text{tri}_{2 \\alpha}( \\text{atan2}(y / x)) ] / r^2) \\\\
f(x) = ${getFxEquation()} \\\\
\\end{matrix}`;
};

var getTertiaryEquation = () => {
    return `\\begin{matrix}
\\begin{matrix} G(q_x, q_y) = ${g_q.toString(2)} ,& \\mathbf{p} = ${getPEquation()} \\end{matrix} \\\\
\\begin{matrix} ${theory.latexSymbol} = \\max \\rho^{0.4} ,& \\alpha = \\pi / n ,& \\beta = ${getBetaEquation()} \\end{matrix} \\\\
\\end{matrix}`;
};

let quaternaryEntries = new Array(4);
var updateQuaternaryEntries = () => {
    quaternaryEntries = [];
    quaternaryEntries.push(new QuaternaryEntry(`q_x`, q_x.toString(2)));
    quaternaryEntries.push(new QuaternaryEntry(`q_y`, q_y.toString(2)));
    quaternaryEntries.push(new QuaternaryEntry(`r`, r.toString(2)));
    quaternaryEntries.push(new QuaternaryEntry(`\\pi(n)`, prime_count_n.toString(2)));
};
var getQuaternaryEntries = () => {
    updateQuaternaryEntries();
    return [];
};

var getFxEquation = (mode = q_mode) => {
    if (mode === Q_MODE_RHO) {
        return `1 + x + x^2`;
    } else if (mode === Q_MODE_R) {
        return `1 / (10^{-2} + \\sqrt{x})`;
    } else {
        return `\\cdots`;
    }
};

var getPEquation = (mode = q_mode) => {
    if (mode === Q_MODE_RHO) {
        return `\\begin{pmatrix} \\pm r^2 \\cos \\alpha & \\pm r^2 \\sin \\alpha \\end{pmatrix}`;
    } else if (mode === Q_MODE_R) {
        return `\\begin{pmatrix} 0 & 0 \\end{pmatrix}`;
    } else {
        return `\\cdots`;
    }
};

var getBetaValue = (mode = q_mode) => {
    if (mode === Q_MODE_RHO) {
        return 0.95;
    } else if (mode === Q_MODE_R) {
        return 0.05;
    } else {
        return 0;
    }
};

var getBetaEquation = (mode = q_mode) => {
    if (mode === Q_MODE_RHO) {
        return `0.95`;
    } else if (mode === Q_MODE_R) {
        return `0.05`;
    } else {
        return `0`;
    }
};

var getEquationOverlay = () => {
    let quaternaryChildren = [];
    updateQuaternaryEntries();
    for (let i = 0; i < quaternaryEntries.length; i++) {
        var entry = quaternaryEntries[i];

        let name = ui.createLatexLabel({
            row: 0, column: 0,
            horizontalOptions: LayoutOptions.END,
            verticalOptions: LayoutOptions.CENTER,
            fontSize: 10,
            text: () => Utils.getMath(`${quaternaryEntries[i].name}`),
        });

        let equal = ui.createLatexLabel({
            row: 0, column: 1,
            horizontalOptions: LayoutOptions.CENTER,
            verticalOptions: LayoutOptions.CENTER,
            margin: new Thickness(2, 0, 5, 10),
            fontSize: 10,
            textColor: Color.fromRgb(228 / 255, 228 / 255, 228 / 255),
            text: `=`,
        });

        let value = ui.createLatexLabel({
            row: 0, column: 2,
            horizontalOptions: LayoutOptions.START,
            verticalOptions: LayoutOptions.CENTER,
            margin: new Thickness(0, 0, 10, 10),
            fontSize: 10,
            textColor: Color.fromRgb(248 / 255, 248 / 255, 248 / 255),
            text: () => Utils.getMath(`${quaternaryEntries[i].value}`),
        });

        quaternaryChildren.push(ui.createGrid({
            row: i, column: 0,
            columnDefinitions: ['*', 'auto', '80'],
            children: [
                name, equal, value
            ]
        }));
    }

    let result = ui.createGrid({
        inputTransparent: false,
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
                    qModeFrame
                ]
            }),
            ui.createGrid({
                row: 0, column: 1,
                horizontalOptions: LayoutOptions.END,
                children: quaternaryChildren
            }),
        ]
    });
    return result;
};

var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getC2 = (level) => BigNumber.TWO.pow(level);
var getQ1 = (level) => Utils.getStepwisePowerSum(level, 2, 5, 3);
var getR1 = (level) => BigNumber.from(1.4).pow(level);
var getN = (level) => 3 + level;

var getPublicationMultiplier = (tau) => tau.pow(0.23);
var getPublicationMultiplierFormula = (symbol) => `(${symbol})^{0.23}`;
var getCurrencyFromTau = (tau) => [tau.pow(1 / 0.4), currency.symbol];
var getTau = () => currency.value.pow(0.4);
var get3DGraphPoint = () => graph3DSystem.state;
var get3DGraphTranslation = () => graph3DSystem.stateTranslation;

init();
