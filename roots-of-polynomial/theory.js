import { FreeCost, LinearCost, ExponentialCost, CustomCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

import { Aspect } from "./api/ui/properties/Aspect";
import { ClearButtonVisibility } from "./api/ui/properties/ClearButtonVisibility";
import { Color } from "./api/ui/properties/Color";
import { CornerRadius } from "./api/ui/properties/CornerRadius";
import { Easing } from "./api/ui/properties/Easing";
import { FontAttributes } from "./api/ui/properties/FontAttributes";
import { FontFamily } from "./api/ui/properties/FontFamily";
import { ImageSource } from "./api/ui/properties/ImageSource";
import { Keyboard } from "./api/ui/properties/Keyboard";
import { LayoutOptions } from "./api/ui/properties/LayoutOptions";
import { LineBreakMode } from "./api/ui/properties/LineBreakMode";
import { ReturnType } from "./api/ui/properties/ReturnType";
import { ScrollBarVisibility } from "./api/ui/properties/ScrollBarVisibility";
import { ScrollOrientation } from "./api/ui/properties/ScrollOrientation";
import { TextAlignment } from "./api/ui/properties/TextAlignment";
import { TextDecorations } from "./api/ui/properties/TextDecorations";
import { Thickness } from "./api/ui/properties/Thickness";
import { TouchEvent } from "./api/ui/properties/TouchEvent";
import { TouchType } from "./api/ui/properties/TouchType";

class TypeUtils {
    static isBigNumber(value) {
        return value.depth !== undefined;
    }
}

class BigComplexNumber {
    static NEGATIVE_THREE_ZERO;
    static NEGATIVE_ONE_ZERO;
    static ZERO_NEGATIVE_ONE;
    static ZERO_ZERO;
    static ZERO_ONE;
    static ZERO_SQRT_THREE_DIV_TWO;
    static POINT_THREE_REPEATING_ZERO;
    static POINT_FIVE_ZERO;
    static ONE_ZERO;
    static TWO_ZERO;
    static E_ZERO;
    static THREE_ZERO;
    static FOUR_ZERO;
    static NINE_ZERO;
    static TWENTY_SEVEN_ZERO;
    static ONE_HUNDRED_EIGHT_ZERO;
    static PRIMITIVE_CBRT_OF_UNITY;
    static PRIMITIVE_CBRT_OF_UNITY_POW_2;

    static staticInit() {
        BigComplexNumber.NEGATIVE_THREE_ZERO = new BigComplexNumber(-3, 0);
        BigComplexNumber.NEGATIVE_ONE_ZERO = new BigComplexNumber(-1, 0);
        BigComplexNumber.ZERO_NEGATIVE_ONE = new BigComplexNumber(0, -1);
        BigComplexNumber.ZERO_ZERO = new BigComplexNumber(0, 0);
        BigComplexNumber.ZERO_ONE = new BigComplexNumber(0, 1);
        BigComplexNumber.ZERO_SQRT_THREE_DIV_TWO = new BigComplexNumber(0, Math.sqrt(3) / 2);
        BigComplexNumber.POINT_THREE_REPEATING_ZERO = new BigComplexNumber(1.0 / 3.0, 0);
        BigComplexNumber.POINT_FIVE_ZERO = new BigComplexNumber(0.5, 0);
        BigComplexNumber.ONE_ZERO = new BigComplexNumber(1, 0);
        BigComplexNumber.TWO_ZERO = new BigComplexNumber(2, 0);
        BigComplexNumber.E_ZERO = new BigComplexNumber(Math.E, 0);
        BigComplexNumber.THREE_ZERO = new BigComplexNumber(3, 0);
        BigComplexNumber.FOUR_ZERO = new BigComplexNumber(4, 0);
        BigComplexNumber.NINE_ZERO = new BigComplexNumber(9, 0);
        BigComplexNumber.TWENTY_SEVEN_ZERO = new BigComplexNumber(27, 0);
        BigComplexNumber.ONE_HUNDRED_EIGHT_ZERO = new BigComplexNumber(108, 0);
        BigComplexNumber.PRIMITIVE_CBRT_OF_UNITY = new BigComplexNumber(-0.5, BigNumber.THREE.sqrt() / 2);
        BigComplexNumber.PRIMITIVE_CBRT_OF_UNITY_POW_2 = this.PRIMITIVE_CBRT_OF_UNITY.mul(this.PRIMITIVE_CBRT_OF_UNITY);
    }

    realPart;
    imaginaryPart;

    constructor(realPart, imaginaryPart) {
        if (TypeUtils.isBigNumber(realPart)) this.realPart = realPart;
        else this.realPart = BigNumber.from(realPart);
        if (TypeUtils.isBigNumber(imaginaryPart)) this.imaginaryPart = imaginaryPart;
        else this.imaginaryPart = BigNumber.from(imaginaryPart);
    }

    static fromReal(value) {
        return new BigComplexNumber(value, 0);
    }

    static fromImaginary(value) {
        return new BigComplexNumber(0, value);
    }

    static fromPolar(magnitude, theta) {
        return new BigComplexNumber(magnitude * Math.cos(theta), magnitude * Math.sin(theta));
    }

    length() {
        return this.realPart * this.realPart + this.imaginaryPart * this.imaginaryPart;
    }

    magnitude() {
        return this.length().sqrt();
    }

    arg() {
        return Math.atan2(this.imaginaryPart, this.realPart);
    }

    abs() {
        return BigComplexNumber.fromReal(this.magnitude());
    }

    add(other) {
        if (typeof(other) == 'number' || TypeUtils.isBigNumber(other)) {
            return new BigComplexNumber(this.realPart + other, this.imaginaryPart);
        }

        return new BigComplexNumber(this.realPart + other.realPart, this.imaginaryPart + other.imaginaryPart);
    }

    sub(other) {
        if (typeof(other) == 'number' || TypeUtils.isBigNumber(other)) {
            return new BigComplexNumber(this.realPart - other, this.imaginaryPart);
        }

        return new BigComplexNumber(this.realPart - other.realPart, this.imaginaryPart - other.imaginaryPart);
    }

    neg() {
        return new BigComplexNumber(-this.realPart, -this.imaginaryPart);
    }

    mul(other) {
        if (typeof(other) == 'number' || TypeUtils.isBigNumber(other)) {
            return new BigComplexNumber(this.realPart * other, this.imaginaryPart * other);
        }

        const rp = this.realPart * other.realPart - this.imaginaryPart * other.imaginaryPart;
        const ip = other.realPart * this.imaginaryPart + other.imaginaryPart * this.realPart;
        return new BigComplexNumber(rp, ip);
    }

    div(other) {
        if (typeof(other) == 'number' || TypeUtils.isBigNumber(other)) {
            return new BigComplexNumber(this.realPart / other, this.imaginaryPart / other);
        }

        const a = this.realPart;
        const b = this.imaginaryPart;
        const c = other.realPart;
        const d = other.imaginaryPart;
        if (d.abs() < c.abs()) {
            const doc = d / c;
            return new BigComplexNumber((a + b * doc) / (c + d * doc), (b - a * doc) / (c + d * doc));
        } else {
            const cod = c / d;
            return new BigComplexNumber((b + a * cod) / (d + c * cod), (-a + b * cod) / (d + c * cod));
        }
    }

    reciprocal() {
        if (this.isZero()) return BigComplexNumber.ZERO_ZERO;
        return BigComplexNumber.ONE_ZERO.div(this);
    }

    pow(other) {
        if (this.isZero()) {
            return BigComplexNumber.ZERO_ZERO;
        }

        if (typeof(other) == 'number' || TypeUtils.isBigNumber(other)) {
            if (other == 0) {
                return BigComplexNumber.ONE_ZERO;
            }

            const magnitude = this.magnitude().pow(other);
            const theta = this.arg() * other;
            return BigComplexNumber.fromPolar(magnitude, theta);
        }

        if (other.isZero()) {
            return BigComplexNumber.ONE_ZERO;
        }

        const rho = this.magnitude();
        if (rho == 0) return BigComplexNumber.ZERO_ZERO;
        const theta = this.arg();
        const newTheta = other.realPart * theta + other.imaginaryPart * rho.log();
        const newMagnitude = rho.pow(other.realPart) * (-other.imaginaryPart * theta).exp();
        return BigComplexNumber.fromPolar(newMagnitude, newTheta);
    }

    ln() {
        return new BigComplexNumber(this.magnitude().log(), this.arg());
    }

    log(base) {
        return this.ln() / Math.log(base);
    }

    sin() {
        return new BigComplexNumber(Math.sin(this.realPart) * Math.cosh(this.imaginaryPart), Math.cos(this.realPart) * Math.sinh(this.imaginaryPart));
    }

    cos() {
        return new BigComplexNumber(Math.cos(this.realPart) * Math.cosh(this.imaginaryPart), Math.sin(this.realPart) * Math.sinh(this.imaginaryPart));
    }

    tan() {
        const denominator = Math.cos(2 * this.realPart) + Math.cosh(2 * this.imaginaryPart);
        const rp = Math.sin(2 * this.realPart) / denominator;
        const ip = Math.sinh(2 * this.imaginaryPart) / denominator;
        return new BigComplexNumber(rp, ip);
    }

    asin() {
        return BigComplexNumber.ONE_ZERO.sub(this.pow(BigComplexNumber.TWO_ZERO)).sqrt().add(BigComplexNumber.ZERO_ONE.mul(this)).ln().mul(BigComplexNumber.ZERO_NEGATIVE_ONE);
    }

    atan() {
        return BigComplexNumber.TWO_ZERO.mul(BigComplexNumber.ZERO_ONE).reciprocal().mul(BigComplexNumber.ZERO_ONE.add(this).div(BigComplexNumber.ZERO_ONE.sub(this)).ln());
    }

    sqrt() {
        return this.pow(1 / 2);
    }

    cbrt() {
        return this.pow(1 / 3);
    }

    isZero() {
        return this.realPart == 0 && this.imaginaryPart == 0;
    }

    min(other) {
        if (typeof(other) == 'number') {
            return (this.realPart < other || this.imaginaryPart < 0) ? this : other;
        }

        return this.magnitude() < other.magnitude() ? this : other;
    }

    max(other) {
        if (typeof(other) == 'number') {
            return (this.realPart > other || this.imaginaryPart > 0) ? this : other;
        }

        return this.magnitude() > other.magnitude() ? this : other;
    }

    compare(other) {
        if (typeof(other) == 'number') {
            if (this.realPart == other && this.imaginaryPart == 0) return 0;
            return (this.realPart > other || this.imaginaryPart > 0) ? 1 : -1;
        }

        if (this.realPart == other.realPart) {
            return this.imaginaryPart == other.imaginaryPart ? 0 : this.imaginaryPart > other.imaginaryPart ? 1 : -1;
        }

        return this.realPart > other.realPart ? 1 : -1;
    }

    toString() {
        return `(${this.realPart.toNumber()})+(${this.imaginaryPart.toNumber()})i`;
    }

    toLatexString() {
        if (this.imaginaryPart == 0) {
            return this.realPart.toString();
        }
        if (this.realPart == 0) {
            return this.imaginaryPart.toString() + `i`;
        }

        const manualToString = (value) => {
            if (value.sign == 0) return `0.0`;

            value = value.abs();
            const str = value.toString(1, 0, Rounding.NEAREST);
            const digits = value.log10().floor();
            if (digits >= 2) return `${str[0]}e${Math.floor(digits)}`;
            return str;
        }

        let result = ``;
        if (this.realPart.sign == -1) result += `-`;
        result += manualToString(this.realPart);
        if (this.imaginaryPart.sign >= 0) result += `+`; else result += `-`;
        result += manualToString(this.imaginaryPart);
        result += `i`;
        return result;
    }

    stringify() {
        return `${this.realPart.toBase64String()} ${this.imaginaryPart.toBase64String()}`;
    }

    static fromStringified(string) {
        if (string == undefined) return undefined;
        const split = string.split(' ');
        if (split.length != 2) return undefined;
        const rp = BigNumber.fromBase64String(split[0]);
        const ip = BigNumber.fromBase64String(split[1]);
        return new BigComplexNumber(rp, ip);
    }
}

var id = "roots_of_polynomial";
var name = "Roots of Polynomial";
var description = "A basic theory.";
var authors = "BasicallyIAmFox";
var version = 7;

var currency;
var currencyDiscriminant;
var rhodot;
var lambdadot;

var computedRoots, sortedRoots, recomputeRoots;
var computedDiscriminants;
var polynomialDegree;

var stage = 0;
var quaternaryEntries;

// Balancing
var pubPower = 0.15;
var tauRate = 0.4;
var pubExp = pubPower / tauRate;
var getTau = () => currency.value.pow(tauRate);
var getCurrencyFromTau = (tau) => [tau.max(BigNumber.ONE).pow(1 / tauRate), currency.symbol];
var getPublicationMultiplier = (tau) => tau.pow(pubExp);
var getPublicationMultiplierFormula = (symbol) => `${symbol}^{${pubExp}}`;

var testGetE5Rho;
var testSkip1hour;
var testHideTests;

// Regular Upgrades
var a0;
var a0Cost = new FirstFreeCost(new ExponentialCost(10, Math.log2(1.8)));
var getA0 = (level, pd) => {
    if (level == 0) return BigNumber.ZERO;

    return -(BigNumber.FOUR / BigNumber.THREE).pow(level - 1);
};
var getA0Desc = (level) => {
    if (level == 0) return `a_0=0`;

    return `a_0=-(4/3)^{${(level - 1).toFixed(0)}}`;
};
var getA0Info = (level) => {
    if (level == 0) return `a_0=0`;

    return `a_0=${getA0(level).toString(2)}`;
}

var a1;
var a1Cost = new ExponentialCost(50, Math.log2(8));
var getA1 = (level, pd) => {
    return Utils.getStepwisePowerSum(level, 3, 2, 1);
}
var getA1Desc = (level) => {
    return `a_1=${getA1(level).toString(0)}`;
};
var getA1Info = (level) => {
    return `a_1=${getA1(level).toString(0)}`;
};

var a2;
var a2Cost = new ExponentialCost(25, Math.log2(30));
var getA2 = (level, pd) => {
    if (level == 0) return BigNumber.ZERO;

    if ((pd || polynomialDegree) >= 3) {
        return -(BigNumber.THREE * getA1(a1.level + getA1FreeLevels(a1FreeLevels.level), pd).sqrt()).pow(1 - 1 / (1 + Math.log(level)));
    }
    return BigNumber.TWO.pow(-level);
};
var getA2Desc = (level) => {
    if (level == 0) return `a_2=0`;

    if (polynomialDegree >= 3) {
        return `a_2=-{${(BigNumber.THREE * getA1(a1.level + getA1FreeLevels(a1FreeLevels.level)).sqrt()).toString(2)}}^{${(1 - 1 / (1 + Math.log(level))).toFixed(4)}}`;
    }
    return `a_2=2^{-${level}}`;
};
var getA2Info = (level) => {
    if (level == 0) return `a_2=0`;

    if (polynomialDegree >= 3) {
        return `a_2=${getA2(level).toString(2)}`;
    }
    return `a_2=1/${BigNumber.TWO.pow(level).toString(0)}`;
};

var a3;
var a3Cost = new ExponentialCost(1000, Math.log2(180));
var getA3 = (level, pd) => {
    if (level == 0) return BigNumber.ZERO;

    if ((pd || polynomialDegree) >= 4) {
        return BigNumber.THREE.pow(Math.pow(level, 0.9) / 2);
    }
    return 0.075 * BigNumber.THREE.pow(-Math.pow(level, 0.9));
};
var getA3Desc = (level) => {
    if (level == 0) return `a_3=0`;

    if (polynomialDegree >= 4) {
        return `a_3=3^{${(Math.pow(level, 0.9) / 2).toFixed(2)}}`;
    }
    return `a_3=0.075 \\cdot 3^{-${BigNumber.from(level).pow(0.9).toString(2)}}`;
};
var getA3Info = (level) => {
    if (level == 0) return `a_3=0`;

    if (polynomialDegree >= 4) {
        return `a_3=${getA3(level).toString(2)}`;
    }
    return `a_3=1/${(BigNumber.ONE / getA3(level)).toString(2)}`;
};

var a4;
var a4Cost = new ExponentialCost(BigNumber.from("1e120"), BigNumber.from("3.5e5").log2());
var getA4 = (level, pd) => {
    if (level == 0) return BigNumber.ZERO;

    return BigNumber.FOUR.pow(1 + 0.1 * level);
};
var getA4Desc = (level) => {
    if (level == 0) return `a_4=0`;

    return `a_4=${getA4(level).toString(2)}`;
};
var getA4Info = (level) => {
    if (level == 0) return `a_4=0`;

    return `a_4=4^{${(1 + 0.1 * level).toFixed(1)}}`
};

var a5;
var a5Cost = new ExponentialCost(BigNumber.from("1e500"), BigNumber.from("5e100").log2());
var getA5 = (level, pd) => BigNumber.from(level).pow(0.25) / 16;
var getA5Desc = (level) => `a_5=${getA5(level).toString(4)}`;
var getA5Info = (level) => `a_5=\\sqrt[4]{${level}}/16`;

var a0FreeLevels;
var a0FreeLevelsCost = new ExponentialCost(50, Math.log2(2.5));
var getA0FreeLevels = (level) => 2 * level;
var getA0FreeLevelsDesc = (_) => `{2} \\uparrow \\text{level of variable } a_0`;
var getA0FreeLevelsInfo = (level) => `{${(2 * level).toFixed(1)}} \\uparrow \\text{level of variable } a_0`;

var a1FreeLevels;
var a1FreeLevelsCost = new ExponentialCost(100, Math.log2(20));
var getA1FreeLevels = (level) => 3 * level;
var getA1FreeLevelsDesc = (_) => `{3} \\uparrow \\text{level of variable } a_1`;
var getA1FreeLevelsInfo = (level) => `{${(3 * level).toFixed(1)}} \\uparrow \\text{level of variable } a_1`;

var a2FreeLevels;
var a2FreeLevelsCost = new ExponentialCost(10, Math.log2(4));
var getA2FreeLevels = (level) => 5 * level;
var getA2FreeLevelsDesc = (_) => `{5} \\uparrow \\text{level of variable } a_2`;
var getA2FreeLevelsInfo = (level) => `{${(5 * level).toFixed(1)}} \\uparrow \\text{level of variable } a_2`;

// Permanent Upgrades
var maxPolynomialDegreePerma;

// Checkpoint Upgrades
var milestoneCost = new CustomCost(level => {
    const costs = [
        10,
        20,
        30,
        9999
    ];

    return BigNumber.from(costs[level] * tauRate);
});
var discriminantMs;
var a0BaseMs;
var a1PowerMs;
var a4HypopMs;
var a5HypopMs;

const rootSolvers = [
    (_) => { throw new Error() },
    (coefficients) => { // Bx^1 + A = 0
        // Remap the variables.
        // Ax^1 + B = 0
        const A = coefficients[1];
        const B = coefficients[0];

        return [ (A != 0) ? BigComplexNumber.fromReal(-B / A) : ZERO_ZERO ];
    },
    (coefficients) => { // Cx^2 + Bx^1 + A = 0
        // Remap the variables.
        // Ax^2 + Bx^1 + C = 0
        const A = coefficients[2];
        const B = coefficients[1];
        const C = coefficients[0];

        const discriminant = BigComplexNumber.fromReal(B * B - 4 * A * C).sqrt();
        return [ discriminant.add(-B).div(A * 2), discriminant.sub(-B).div(A * 2) ];
    },
    (coefficients) => { // Dx^3 + Cx^2 + Bx^1 + A = 0
        // Remap the variables.
        // Ax^3 + Bx^2 + Cx^1 + D = 0
        const A = BigComplexNumber.fromReal(coefficients[3]);
        const B = BigComplexNumber.fromReal(coefficients[2]);
        const C = BigComplexNumber.fromReal(coefficients[1]);
        const D = BigComplexNumber.fromReal(coefficients[0]);

        const d0 = B.mul(B).sub(A.mul(C).mul(3));
        const d1 = B.mul(B).mul(B).mul(2).sub(A.mul(B).mul(C).mul(9)).add(A.mul(A).mul(D).mul(27));
        const c = d1.mul(d1).sub(d0.mul(d0).mul(d0).mul(4)).sqrt().add(d1).div(2).cbrt();

        const cbrt0 = BigComplexNumber.ONE_ZERO.mul(c);
        const cbrt1 = BigComplexNumber.PRIMITIVE_CBRT_OF_UNITY.mul(c);
        const cbrt2 = BigComplexNumber.PRIMITIVE_CBRT_OF_UNITY_POW_2.mul(c);

        const commonTerm = A.mul(3).reciprocal().neg();
        const root0 = cbrt0.reciprocal().mul(d0).add(cbrt0).add(B).mul(commonTerm);
        const root1 = cbrt1.reciprocal().mul(d0).add(cbrt1).add(B).mul(commonTerm);
        const root2 = cbrt2.reciprocal().mul(d0).add(cbrt2).add(B).mul(commonTerm);

        return [ root0, root1, root2 ];
    },
    (coefficients) => { // Ex^4 + Dx^3 + Cx^2 + Bx^1 + A = 0
        // Remap the variables.
        // Ax^4 + Bx^3 + Cx^2 + Dx^1 + E = 0
        const A = coefficients[4];
        const B = coefficients[3];
        const C = coefficients[2];
        const D = coefficients[1];
        const E = coefficients[0];

        const ud = 1; // x^4
        const ua = -3 * B * B / (8 * A * A) + C / A; // x^2
        const ub = B * B * B / (8 * A * A * A) - B * C / (2 * A * A) + D / A; // x^1
        const uc = -3 * B * B * B * B / (256 * A * A * A * A) + C * B * B / (16 * A * A * A) - B * D / (4 * A * A) + E / A; // x^0

        if (ub == 0) { // This is a biquadratic equation, much easier to solve. (same as degree 2)
            const roots = rootSolvers[2]([ud, ua, uc]);

            return [ roots[0], roots[0].neg(), roots[1], roots[1].neg() ]
        } else {
            const p = -(ua * ua / 12) - uc;
            const q = -(ua * ua * ua / 108) + ua * uc / 3 - ub * ub / 8;

            const r = BigComplexNumber.fromReal(q * q / 4 + p * p * p / 27).sqrt().sub(q / 2);
            const u = r.cbrt();

            const y = (r.isZero() ? BigComplexNumber.fromReal(q).cbrt().neg() : u.sub(u.mul(3).reciprocal().mul(p))).add(-5 * A / 6);
            const w = y.mul(2).add(ua).sqrt();

            const term = -B / (4 * A);
            const v0 = y.mul(2).add(3 * ua).add(w.reciprocal().mul(2 * ub)).neg().sqrt();
            const v1 = y.mul(2).add(3 * ua).sub(w.reciprocal().mul(2 * ub)).neg().sqrt();

            const x0 = v0.add(w).div(2).add(term);
            const x1 = v0.neg().add(w).div(2).add(term);
            const x2 = v1.sub(w).div(2).add(term);
            const x3 = v1.neg().sub(w).div(2).add(term);

            return [ x0, x1, x2, x3 ];
        }
    },
    (coefficients) => { // Fx^5 + Ex^4 + Dx^3 + Cx^2 + Bx^1 + A = 0
        const A = coefficients[0];
        const B = coefficients[1];
        const C = coefficients[2];
        const D = coefficients[3];
        const E = coefficients[4];
        const F = coefficients[5];

        const getPolynomial = (x) => x.pow(5).mul(F).add(x.pow(4).mul(E)).add(x.pow(3).mul(D)).add(x.pow(2).mul(C)).add(x.mul(B)).add(A);
        const getPolynomialDelta = (x) => x.pow(4).mul(5 * F).add(x.pow(3).mul(4 * E)).add(x.pow(2).mul(3 * D)).add(x.mul(2 * C)).add(B);

        const approximations = new Array(5);
        approximations[0] = computedRoots[0];
        approximations[1] = computedRoots[1];
        approximations[2] = computedRoots[2];
        approximations[3] = computedRoots[3];
        approximations[4] = computedRoots[4];
        for (let i = 0; i < 3; i++) {
            approximations[0] = approximations[0].sub(getPolynomial(approximations[0]).div(getPolynomialDelta(approximations[0])).div(approximations[0].sub(approximations[1]).reciprocal().add(approximations[0].sub(approximations[2]).reciprocal()).add(approximations[0].sub(approximations[3]).reciprocal()).add(approximations[0].sub(approximations[4]).reciprocal())));
            approximations[1] = approximations[1].sub(getPolynomial(approximations[1]).div(getPolynomialDelta(approximations[1])).div(approximations[1].sub(approximations[0]).reciprocal().add(approximations[1].sub(approximations[2]).reciprocal()).add(approximations[1].sub(approximations[3]).reciprocal()).add(approximations[1].sub(approximations[4]).reciprocal())));
            approximations[2] = approximations[2].sub(getPolynomial(approximations[2]).div(getPolynomialDelta(approximations[2])).div(approximations[2].sub(approximations[0]).reciprocal().add(approximations[2].sub(approximations[1]).reciprocal()).add(approximations[2].sub(approximations[3]).reciprocal()).add(approximations[2].sub(approximations[4]).reciprocal())));
            approximations[3] = approximations[3].sub(getPolynomial(approximations[3]).div(getPolynomialDelta(approximations[3])).div(approximations[3].sub(approximations[0]).reciprocal().add(approximations[3].sub(approximations[1]).reciprocal()).add(approximations[3].sub(approximations[2]).reciprocal()).add(approximations[3].sub(approximations[4]).reciprocal())));
            approximations[4] = approximations[4].sub(getPolynomial(approximations[4]).div(getPolynomialDelta(approximations[4])).div(approximations[4].sub(approximations[0]).reciprocal().add(approximations[4].sub(approximations[1]).reciprocal()).add(approximations[4].sub(approximations[2]).reciprocal()).add(approximations[4].sub(approximations[3]).reciprocal())));
        }
        return approximations;
    }
];

var init = () => {
    currency = theory.createCurrency();
    currencyDiscriminant = theory.createCurrency('λ', '\\lambda');
    quaternaryEntries = [];

    computedRoots = [ BigComplexNumber.ZERO_ZERO, BigComplexNumber.ZERO_ZERO, BigComplexNumber.ZERO_ZERO, BigComplexNumber.ZERO_ZERO, BigComplexNumber.ZERO_ZERO ];
    sortedRoots = [ 0, 1, 2, 3, 4 ];
    computedDiscriminants = [ BigNumber.ZERO, BigNumber.ZERO, BigNumber.ZERO ];
    recomputeRoots = true;
    rhodot = BigNumber.ZERO;
    lambdadot = BigNumber.ZERO;
    
    ///////////////////
    // Regular Upgrades

    // a0
    {
        a0 = theory.createUpgrade(0, currency, a0Cost);
        a0.getDescription = (_) => Utils.getMath(getA0Desc(a0.level + getA0FreeLevels(a0FreeLevels.level)));
        a0.getInfo = (amount) => Utils.getMathTo(getA0Info(a0.level + getA0FreeLevels(a0FreeLevels.level)), getA0Info(a0.level + getA0FreeLevels(a0FreeLevels.level) + amount));
        a0.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 0);
            recomputeRoots = true;
        };
        a0.canBeRefunded = () => true;
    }

    // a1
    {
        a1 = theory.createUpgrade(1, currency, a1Cost);
        a1.getDescription = (_) => Utils.getMath(getA1Desc(a1.level + getA1FreeLevels(a1FreeLevels.level)));
        a1.getInfo = (amount) => Utils.getMathTo(getA1Info(a1.level + getA1FreeLevels(a1FreeLevels.level)), getA1Info(a1.level + getA1FreeLevels(a1FreeLevels.level) + amount));
        a1.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 1);
            recomputeRoots = true;
        };
        a1.canBeRefunded = () => true;
    }

    // a2
    {
        a2 = theory.createUpgrade(2, currency, a2Cost);
        a2.getDescription = (_) => Utils.getMath(getA2Desc(a2.level + getA2FreeLevels(a2FreeLevels.level)));
        a2.getInfo = (amount) => Utils.getMathTo(getA2Info(a2.level + getA2FreeLevels(a2FreeLevels.level)), getA2Info(a2.level + getA2FreeLevels(a2FreeLevels.level) + amount));
        a2.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 2);
            recomputeRoots = true;
        };
        a2.canBeRefunded = () => true;
    }

    // a3
    {
        a3 = theory.createUpgrade(3, currency, a3Cost);
        a3.getDescription = (_) => Utils.getMath(getA3Desc(a3.level));
        a3.getInfo = (amount) => Utils.getMathTo(getA3Info(a3.level), getA3Info(a3.level + amount));
        a3.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 3);
            recomputeRoots = true;
        };
        a3.canBeRefunded = () => true;
    }

    // a4
    {
        a4 = theory.createUpgrade(4, currency, a4Cost);
        a4.getDescription = (_) => Utils.getMath(getA4Desc(a4.level));
        a4.getInfo = (amount) => Utils.getMathTo(getA4Info(a4.level), getA4Info(a4.level + amount));
        a4.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 4);
            recomputeRoots = true;
        };
    }

    // a5
    {
        a5 = theory.createUpgrade(5, currency, a5Cost);
        a5.getDescription = (_) => Utils.getMath(getA5Desc(a5.level));
        a5.getInfo = (amount) => Utils.getMathTo(getA5Info(a5.level), getA5Info(a5.level + amount));
        a5.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 5);
            recomputeRoots = true;
        };
    }

    {
        a0FreeLevels = theory.createUpgrade(100, currencyDiscriminant, a0FreeLevelsCost);
        a0FreeLevels.getDescription = (_) => Utils.getMath(getA0FreeLevelsDesc(a0FreeLevels.level));
        a0FreeLevels.getInfo = (amount) => Utils.getMathTo(getA0FreeLevelsInfo(a0FreeLevels.level), getA0FreeLevelsInfo(a0FreeLevels.level + amount));
        a0FreeLevels.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 0);
            recomputeRoots = true;
        };

        a1FreeLevels = theory.createUpgrade(101, currencyDiscriminant, a1FreeLevelsCost);
        a1FreeLevels.getDescription = (_) => Utils.getMath(getA1FreeLevelsDesc(a1FreeLevels.level));
        a1FreeLevels.getInfo = (amount) => Utils.getMathTo(getA1FreeLevelsInfo(a1FreeLevels.level), getA1FreeLevelsInfo(a1FreeLevels.level + amount));
        a1FreeLevels.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 1);
            recomputeRoots = true;
        };

        a2FreeLevels = theory.createUpgrade(102, currencyDiscriminant, a2FreeLevelsCost);
        a2FreeLevels.getDescription = (_) => Utils.getMath(getA2FreeLevelsDesc(a2FreeLevels.level));
        a2FreeLevels.getInfo = (amount) => Utils.getMathTo(getA2FreeLevelsInfo(a2FreeLevels.level), getA2FreeLevelsInfo(a2FreeLevels.level + amount));
        a2FreeLevels.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 2);
            recomputeRoots = true;
        };
    }

    ///////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e7);
    theory.createBuyAllUpgrade(1, currency, 1e10);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    {
        maxPolynomialDegreePerma = theory.createPermanentUpgrade(3, currency, new CustomCost(level => {
            if (level == 0) {
                return BigNumber.from("1e5");
            } else if (level == 1) {
                return BigNumber.from("1e125");
            } else if (level == 2) {
                return BigNumber.from("1e500");
            }
            return BigNumber.ZERO;
        }));
        maxPolynomialDegreePerma.getDescription = (_) => `Increase maximum polynomial degree`;
        maxPolynomialDegreePerma.getInfo = (amount) => `Increases maximum polynomial degree to ${maxPolynomialDegreePerma.level + amount + 2}, unlocks new variable${(amount > 1 ? 's' : '')}`;
        maxPolynomialDegreePerma.bought = (_) => updateAvailability();
        maxPolynomialDegreePerma.maxLevel = 3;
    }

    /////////////////////
    // Checkpoint Upgrades
    theory.setMilestoneCost(milestoneCost);

    {
        discriminantMs = theory.createMilestoneUpgrade(0, 4);
        discriminantMs.getDescription = (_) => Localization.getUpgradeUnlockDesc(`\\Delta^{${1 + discriminantMs.level}}`);
        discriminantMs.getInfo = (_) => Localization.getUpgradeUnlockInfo(`\\Delta^{${1 + discriminantMs.level}}`);
        discriminantMs.boughtOrRefunded = (_) => {
            recomputeRoots = true;
            updateAvailability();
        };
    }

    /*{
        a0BaseMs = theory.createMilestoneUpgrade(0, 2);
        a0BaseMs.description = `Increase the base of ${Utils.getMath(`a_0`)}`;
        a0BaseMs.getInfo = (amount) => Utils.getMathTo(`a_0={${2 + a0BaseMs.level / 2}}^{-${a0.level}}`, `a_0={${2 + (a0BaseMs.level + amount) / 2}}^{-${a0.level}}`);
        a0BaseMs.boughtOrRefunded = (_) => recomputeRoots = true;
    }

    {
        a1PowerMs = theory.createMilestoneUpgrade(1, 3);
        a1PowerMs.description = `Increase the power of ${Utils.getMath(`a_1`)}`;
        a1PowerMs.getInfo = (amount) => Utils.getMathTo(`a_1^{${1 + a1PowerMs.level * 0.01}}`, `a_1^{${1 + (a1PowerMs.level + amount) * 0.01}}`);
        a1PowerMs.boughtOrRefunded = (_) => recomputeRoots = true;
    }*/

    {
        a4HypopMs = theory.createMilestoneUpgrade(2, 1);
        a4HypopMs.description = `Increase the arithmetic operator power of ${Utils.getMath(`1+x_3`)}`;
        a4HypopMs.getInfo = (_) => {
            return `todo later`;
        };
        a4HypopMs.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            updateAvailability();
        };
        a4HypopMs.canBeRefunded = (_) => a5HypopMs.level == 0;
    }

    {
        a5HypopMs = theory.createMilestoneUpgrade(3, 2);
        a5HypopMs.description = `Increase the arithmetic operator power of ${Utils.getMath(`1+x_4`)}`;
        a5HypopMs.getInfo = (_) => {
            return `todo later`;
        };
        a5HypopMs.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            updateAvailability();
        };
    }

    /////////////////////
    // Test Upgrades
    {
        testHideTests = theory.createPermanentUpgrade(10000000, currency, new FreeCost());
        testHideTests.description = `Test: Hide test upgrades`;
        testHideTests.bought = (_) => {
            testHideTests.level %= 2;
            testGetE5Rho.isAvailable = testHideTests.level == 0;
            testSkip1hour.isAvailable = testHideTests.level == 0;
        };

        testGetE5Rho = theory.createSingularUpgrade(10000000, currency, new FreeCost());
        testGetE5Rho.description = `Test: Get e5$\\rho$ for free`;
        testGetE5Rho.bought = (_) => {
            currency.value *= 1e5;
            testGetE5Rho.level = 0;
        };

        testSkip1hour = theory.createSingularUpgrade(10000001, currency, new FreeCost());
        testSkip1hour.description = `Test: Skip 1 hour`;
        testSkip1hour.bought = (_) => {
            tick(3600, 1);
            testSkip1hour.level = 0;
        };
    }

    polynomialDegree = getHighestPolynomialDegree();
    updateAvailability();
};

var updateAvailability = () => {
    a3.isAvailable = maxPolynomialDegreePerma.level >= 1;
    a4.isAvailable = maxPolynomialDegreePerma.level >= 2;
    a5.isAvailable = maxPolynomialDegreePerma.level >= 3;
    a0FreeLevels.isAvailable = discriminantMs.level > 0;
    a1FreeLevels.isAvailable = discriminantMs.level > 0;
    a2FreeLevels.isAvailable = discriminantMs.level > 0;

    a4HypopMs.isAvailable = a4.isAvailable;
    a5HypopMs.isAvailable = a5.isAvailable && a4HypopMs.level > 0;

    testGetE5Rho.isAvailable = testHideTests.level == 0;
    testSkip1hour.isAvailable = testHideTests.level == 0;
};

var tick = (elapsedTime, multiplier) => {
    if (stage == 1 && discriminantMs.level == 0) {
        goToPreviousStage();
    }

    if (recomputeRoots || polynomialDegree >= 5) {
        computeRoots();
        computeDiscriminants();
        theory.invalidateQuaternaryValues();
        recomputeRoots = false;
    }

    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    rhodot = calculateRhodot(polynomialDegree, i => computedRoots[sortedRoots[i]]) * bonus;
    lambdadot = calculateLambdadot();
    currency.value += rhodot * dt;
    currencyDiscriminant.value += lambdadot * dt;

    theory.invalidateTertiaryEquation();
};

var calculateRhodot = (polynomialDegree, getRoot) => {
    let result = getRoot(0);
    if (polynomialDegree >= 2) result = result.mul(getRoot(1).add(1));
    if (polynomialDegree >= 3) result = result.mul(getRoot(2));
    if (polynomialDegree >= 4 && a4HypopMs.level == 0) result = result.mul(getRoot(3).add(1));
    if (polynomialDegree >= 5 && a5HypopMs.level == 0) result = result.mul(getRoot(4));
    if (polynomialDegree >= 4 && a4HypopMs.level == 1) result = result.pow(getRoot(3).add(1));
    if (polynomialDegree >= 5 && a5HypopMs.level == 1) result = result.pow(getRoot(4).add(1));
    if (polynomialDegree >= 5 && a5HypopMs.level == 2 && !result.isZero()) result = BigComplexNumber.E_ZERO.pow(result.ln().pow(getRoot(4).add(1)));
    return result.magnitude();
};

var calculateLambdadot = () => {
    let result = computedDiscriminants[0];
    for (let i = 1; i < computedDiscriminants.length; i++) {
        if (discriminantMs.level > i) result = result.mul(computedDiscriminants[i]);
    }
    return result.abs().realPart;
};

var sortRoots = (polynomialDegree, roots) => {
    const reduceIndex = (array, comparator) => {
        let result = 0;
        for (let i = 1; i < array.length; i++) {
            if (comparator(array[result], array[i], i) >= 0) {
                result = 1;
                i += 1;
            }
        }
        return result;
    }

    let result = [ 0, 1, 2, 3, 4 ];

    if (polynomialDegree >= 5 && a5HypopMsLevel >= 1) {
        const goal = BigComplexNumber.ONE_ZERO;
        const leastIndex = reduceIndex(roots, (curr, next) => next.sub(1).sub(goal).compare(curr.sub(1).sub(goal)));
        if (leastIndex != 4) {
            result[4] = leastIndex;
            result[leastIndex] = 4;
        }
    }

    if (polynomialDegree >= 4) {
        const goal = BigComplexNumber.ONE_ZERO;
        const leastIndex = reduceIndex(roots, (curr, next, i) => {
            if (i >= 4) return -1;
            return next.sub(1).sub(goal).compare(curr.sub(1).sub(goal));
        });
        if (leastIndex != 3) {
            result[3] = leastIndex;
            result[leastIndex] = 3;
        }
    }

    if (polynomialDegree >= 2) {
        let leastIndex = 1;
        if (roots[leastIndex].add(1).abs().compare(roots[0].add(1).abs()) >= 0) leastIndex = 0;
        if (polynomialDegree >= 3 && roots[leastIndex].add(1).abs().compare(roots[2].add(1).abs()) >= 0) leastIndex = 2;
        if (polynomialDegree >= 5 && a5HypopMs.level == 0 && roots[leastIndex].add(1).abs().compare(roots[4].add(1).abs()) >= 0) leastIndex = 4;
        if (leastIndex != 1) {
            result[1] = leastIndex;
            result[leastIndex] = 1;
        }
    }

    return result.slice(0, polynomialDegree);
};

var computeRoots = () => {
    const newRoots = rootSolvers[polynomialDegree]([
        getA0(a0.level + getA0FreeLevels(a0FreeLevels.level)),
        getA1(a1.level + getA1FreeLevels(a1FreeLevels.level)),
        getA2(a2.level + getA2FreeLevels(a2FreeLevels.level)),
        getA3(a3.level),
        getA4(a4.level),
        getA5(a5.level)
    ]);
    computedRoots[0] = computedRoots[1] = computedRoots[2] = computedRoots[3] = computedRoots[4] = BigComplexNumber.ZERO_ZERO;
    for (let i = 0; i < newRoots.length; i++) {
        computedRoots[i] = newRoots[i];
    }
    sortedRoots = sortRoots(polynomialDegree, computedRoots);
}

var computeDiscriminants = () => {
    computedDiscriminants[0] = discriminantMs.level < 1 ? BigComplexNumber.ZERO_ZERO : BigComplexNumber.ONE_ZERO;
    computedDiscriminants[1] = discriminantMs.level < 2 ? BigComplexNumber.ZERO_ZERO : BigComplexNumber.fromReal((() => {
        const a = getA2(a2.level, 2);
        if (a == 0) return BigNumber.ZERO;
        const b = getA1(a1.level, 2);
        const c = getA0(a0.level, 2);
        return -(b*b + 4*a*c) / a;
    })()).pow(1 / 10);
    computedDiscriminants[2] = discriminantMs.level < 3 ? BigComplexNumber.ZERO_ZERO : BigComplexNumber.fromReal((() => {
        const a = getA3(a3.level, 3);
        if (a == 0) return BigNumber.ZERO;
        const b = getA2(a2.level, 3);
        const c = getA1(a1.level, 3);
        const d = getA0(a0.level, 3);
        return -(-27*a*a*d*d + 18*a*b*c*d - 4*a*c*c*c - 4*b*b*b*d + b*b*c*c) / a;
    })()).pow(1 / 15);
    computedDiscriminants[3] = discriminantMs.level < 4 ? BigComplexNumber.ZERO_ZERO : BigComplexNumber.fromReal((() => {
        const a = getA4(a4.level, 4);
        if (a == 0) return BigNumber.ZERO;
        const b = getA3(a3.level, 4);
        const c = getA2(a2.level, 4);
        const d = getA1(a1.level, 4);
        const e = getA0(a0.level, 4);
        return (256*a*a*a*e*e*e - 192*a*a*b*d*e*e - 128*a*a*c*c*e*e + 144*a*a*c*d*d*e - 27*a*a*d*d*d*d + 144*a*b*b*c*e*e - 6*a*b*b*d*d*e - 80*a*b*c*c*d*e + 18*a*b*c*d*d*d + 16*a*c*c*c*c*e - 4*a*c*c*c*d*d - 27*b*b*b*b*e*e + 18*b*b*b*c*d*e - 4*b*b*b*d*d*d - 4*b*b*c*c*c*e + b*b*c*c*d*d) / a;
    })()).pow(1 / 20);
};

var getInternalState = () => JSON.stringify({
    stage: stage,
    polynomialDegree: polynomialDegree,
    computedRoots: {
        "0": computedRoots[0].stringify(),
        "1": computedRoots[1].stringify(),
        "2": computedRoots[2].stringify(),
        "3": computedRoots[3].stringify(),
        "4": computedRoots[4].stringify()
    },
    sortedRoots: {
        "0": sortedRoots[0],
        "1": sortedRoots[1],
        "2": sortedRoots[2],
        "3": sortedRoots[3],
        "4": sortedRoots[4]
    },
    computedDiscriminants: {
        "0": computedDiscriminants[0].stringify(),
        "1": computedDiscriminants[1].stringify(),
        "2": computedDiscriminants[2].stringify()
    }
});

var setInternalState = (stateStr) => {
    if (!stateStr) return;

    const state = JSON.parse(stateStr);
    stage = state.stage ?? stage;
    polynomialDegree = state.polynomialDegree ?? getHighestPolynomialDegree();
    computedRoots = [ BigComplexNumber.ZERO_ZERO, BigComplexNumber.ZERO_ZERO, BigComplexNumber.ZERO_ZERO, BigComplexNumber.ZERO_ZERO, BigComplexNumber.ZERO_ZERO ];
    if (state.computedDiscriminants) {
        computedRoots[0] = BigComplexNumber.fromStringified(state.computedRoots[0]) ?? BigComplexNumber.ZERO_ZERO;
        computedRoots[1] = BigComplexNumber.fromStringified(state.computedRoots[1]) ?? BigComplexNumber.ZERO_ZERO;
        computedRoots[2] = BigComplexNumber.fromStringified(state.computedRoots[2]) ?? BigComplexNumber.ZERO_ZERO;
        computedRoots[3] = BigComplexNumber.fromStringified(state.computedRoots[3]) ?? BigComplexNumber.ZERO_ZERO;
        computedRoots[4] = BigComplexNumber.fromStringified(state.computedRoots[4]) ?? BigComplexNumber.ZERO_ZERO;
    }
    sortedRoots = [ 0, 1, 2, 3, 4 ];
    if (state.sortedRoots) {
        sortedRoots[0] = state.sortedRoots[0] ?? 0;
        sortedRoots[1] = state.sortedRoots[1] ?? 1;
        sortedRoots[2] = state.sortedRoots[2] ?? 2;
        sortedRoots[3] = state.sortedRoots[3] ?? 3;
        sortedRoots[4] = state.sortedRoots[4] ?? 4;
    }
    computedDiscriminants = [ BigComplexNumber.ZERO_ZERO, BigComplexNumber.ZERO_ZERO, BigComplexNumber.ZERO_ZERO, BigComplexNumber.ZERO_ZERO ];
    if (state.computedDiscriminants) {
        computedDiscriminants[0] = BigComplexNumber.fromStringified(state.computedDiscriminants[0]) ?? BigComplexNumber.ZERO_ZERO;
        computedDiscriminants[1] = BigComplexNumber.fromStringified(state.computedDiscriminants[1]) ?? BigComplexNumber.ZERO_ZERO;
        computedDiscriminants[2] = BigComplexNumber.fromStringified(state.computedDiscriminants[2]) ?? BigComplexNumber.ZERO_ZERO;
        computedDiscriminants[3] = BigComplexNumber.fromStringified(state.computedDiscriminants[3]) ?? BigComplexNumber.ZERO_ZERO;
    }
};

var postPublish = () => {
    recomputeRoots = true;
    polynomialDegree = getHighestPolynomialDegree();
};

var getPrimaryEquation = () => {
    let result = ``;
    if (stage == 0) {
        theory.primaryEquationScale = 0.9;
        theory.primaryEquationHeight = 100;

        result = `\\begin{cases}`;
        result += `P(x)=\\sum_{k=0}^{${polynomialDegree}}{a_kx^k} \\\\`;
        result += `x \\in \\mathbb{C} \\mid P(x) = \\{x_0`;
        if (polynomialDegree == 1 || polynomialDegree == 2) result += `,x_1`;
        if (polynomialDegree == 2) result += `,x_2`;
        if (polynomialDegree >= 3) result += `,\\cdots,x_${polynomialDegree - 1}`;
        result += `\\} \\\\`;
        result += `\\dot{\\rho} = |`;
        if (a4.level > 0 && a4HypopMs.level == 1 || a5.level > 0 && a5HypopMs.level == 1) result += `(`;
        result += `{x_0`;
        if (a3.level > 0) result += `x_2`;
        if (a5.level > 0 && a5HypopMs.level == 0) result += `x_4`;
        if (a2.level > 0) result += `(1+x_1)`;
        if (a4.level > 0 && a4HypopMs.level == 0) result += `(1+x_3)`;
        result += `}`;
        if (a4.level > 0 && a4HypopMs.level == 1 || a5.level > 0 && a5HypopMs.level == 1) {
            result += `)^{`;
            if (a4.level > 0 && a4HypopMs.level == 1) result += `(1+x_3)`;
            if (a5.level > 0 && a5HypopMs.level == 1) result += `(1+x_4)`;
            result += `}`;
        }
        if (a5.level > 0 && a5HypopMs.level == 2) result += `\\uparrow^2 (1+x_4)`;
        result += `|`;
        result += `\\end{cases}`;
    } else if (stage == 1) {
        theory.primaryEquationScale = 0.65;
        theory.primaryEquationHeight = 120;

        result = `\\begin{array}{cl}`;
        result += `M_n=\\begin{pmatrix}`;
        result += `a_n & \\cdots & a_0 & 0 & \\cdots & 0 \\\\`;
        result += `0 & \\ddots & \\ddots & \\ddots & \\cdots & \\vdots \\\\`;
        result += `0 & \\cdots & 0 & a_n & \\cdots & a_0 \\\\`;
        result += `na_n & \\cdots & a_1 & 0 & \\cdots & 0 \\\\`;
        result += `0 & \\ddots & \\ddots & \\ddots & \\cdots & \\vdots \\\\`;
        result += `0 & \\cdots & 0 & na_n & \\cdots & a_1 \\\\`;
        result += `\\end{pmatrix} \\\\`;
        result += `D_n = \\sqrt[5+5n]{\\frac{(-1)^{n(n-1)/2}}{a_n} \\text{Res}(M_n)}`;
        result += `\\end{array}`;
    }
    return result;
};

var getSecondaryEquation = () => {
    let result = `\\begin{matrix}`;
    result += `${theory.latexSymbol}=\\max\\rho^{${tauRate}}`;
    if (stage == 1) result += `,& \\dot{${'\\lambda'}}=|\\prod_{n=1}^{${discriminantMs.level}}{D_n}|`;
    result += `\\end{matrix}`;
    return result;
};

var getTertiaryEquation = () => {
    let result = `\\begin{matrix}`;
    result += `\\dot{\\rho}=${rhodot.toString()}`;
    if (discriminantMs.level > 0) result += `,& \\dot{${'\\lambda'}}=${lambdadot.toString()}`;
    result += `\\end{matrix}`;
    return result;
};

var getQuaternaryEntries = () => {
    switch (stage) {
        case 0: {
            if (quaternaryEntries.length == 0) {
                quaternaryEntries.push(new QuaternaryEntry("x_0", null));
                quaternaryEntries.push(new QuaternaryEntry("x_1", null));
                quaternaryEntries.push(new QuaternaryEntry("x_2", null));
                quaternaryEntries.push(new QuaternaryEntry("x_3", null));
                quaternaryEntries.push(new QuaternaryEntry("x_4", null));
            }
            quaternaryEntries[0].value = computedRoots[sortedRoots[0]] && polynomialDegree >= 1 ? computedRoots[sortedRoots[0]].toLatexString() : null;
            quaternaryEntries[1].value = computedRoots[sortedRoots[1]] && polynomialDegree >= 2 ? computedRoots[sortedRoots[1]].toLatexString() : null;
            quaternaryEntries[2].value = computedRoots[sortedRoots[2]] && polynomialDegree >= 3 ? computedRoots[sortedRoots[2]].toLatexString() : null;
            quaternaryEntries[3].value = computedRoots[sortedRoots[3]] && polynomialDegree >= 4 ? computedRoots[sortedRoots[3]].toLatexString() : null;
            quaternaryEntries[4].value = computedRoots[sortedRoots[4]] && polynomialDegree >= 5 ? computedRoots[sortedRoots[4]].toLatexString() : null;
            break;
        }
        case 1: {
            if (quaternaryEntries.length == 0) {
                quaternaryEntries.push(new QuaternaryEntry(`D_1`, null));
                quaternaryEntries.push(new QuaternaryEntry(`D_2`, null));
                quaternaryEntries.push(new QuaternaryEntry(`D_3`, null));
                quaternaryEntries.push(new QuaternaryEntry(`D_4`, null));
            }
            quaternaryEntries[0].value = computedDiscriminants[0] && discriminantMs.level >= 1 ? computedDiscriminants[0].toLatexString() : null;
            quaternaryEntries[1].value = computedDiscriminants[1] && discriminantMs.level >= 2 ? computedDiscriminants[1].toLatexString() : null;
            quaternaryEntries[2].value = computedDiscriminants[2] && discriminantMs.level >= 3 ? computedDiscriminants[2].toLatexString() : null;
            quaternaryEntries[3].value = computedDiscriminants[3] && discriminantMs.level >= 4 ? computedDiscriminants[3].toLatexString() : null;
            break;
        }
    }
    return quaternaryEntries;
};

var isCurrencyVisible = (index) => {
    if (index === 1) return discriminantMs.level > 0;
    return true;
};

var canGoToPreviousStage = () => stage > 0;

var goToPreviousStage = () => {
    stage -= 1;
    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    quaternaryEntries = [];
    theory.invalidateQuaternaryValues();
};

var canGoToNextStage = () => stage < 1 && discriminantMs.level > 0;

var goToNextStage = () => {
    stage += 1;
    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    quaternaryEntries = [];
    theory.invalidateQuaternaryValues();
};

var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();
var getHighestPolynomialDegree = () => {
    if (a5.level > 0) return 5;
    if (a4.level > 0) return 4;
    if (a3.level > 0) return 3;
    if (a2.level > 0) return 2;
    return 1;
};

BigComplexNumber.staticInit();
init();