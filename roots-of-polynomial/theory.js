import { FreeCost, LinearCost, ExponentialCost, CustomCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

class BigComplexNumber {
    realPart;
    imaginaryPart;

    constructor(realPart, imaginaryPart) {
        this.realPart = BigNumber.from(realPart);
        this.imaginaryPart = BigNumber.from(imaginaryPart);
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
        return this.imaginaryPart.sin() / this.realPart.cos();
    }

    abs() {
        return BigComplexNumber.fromReal(this.magnitude());
    }

    add(other) {
        if (typeof(other) == 'number') {
            return new BigComplexNumber(this.realPart + other, this.imaginaryPart);
        }

        return new BigComplexNumber(this.realPart + other.realPart, this.imaginaryPart + other.imaginaryPart);
    }

    sub(other) {
        if (typeof(other) == 'number') {
            return new BigComplexNumber(this.realPart - other, this.imaginaryPart);
        }

        return new BigComplexNumber(this.realPart - other.realPart, this.imaginaryPart - other.imaginaryPart);
    }

    neg() {
        return new BigComplexNumber(-this.realPart, -this.imaginaryPart);
    }

    mul(other) {
        if (typeof(other) == 'number') {
            return new BigComplexNumber(this.realPart * other, this.imaginaryPart * other);
        }

        return new BigComplexNumber(this.realPart * other.realPart - this.imaginaryPart * other.imaginaryPart, this.realPart * other.imaginaryPart + this.imaginaryPart * other.realPart);
    }

    div(other) {
        if (typeof(other) == 'number') {
            return new BigComplexNumber(this.realPart / other, this.imaginaryPart / other);
        }

        const denominator = other.realPart * other.realPart + other.imaginaryPart * other.imaginaryPart;
        return new BigComplexNumber((this.realPart * other.realPart + this.imaginaryPart * other.imaginaryPart) / denominator, (this.realPart * other.imaginaryPart - this.imaginaryPart * other.realPart) / denominator);
    }

    reciprocal() {
        return this.pow(-1);
    }

    pow(other) {
        if (this.isZero()) {
            return ZERO_ZERO;
        }

        const a = typeof(this.realPart) == 'number' ? this.realPart : this.realPart.toNumber();
        const b = typeof(this.imaginaryPart) == 'number' ? this.imaginaryPart : this.imaginaryPart.toNumber();
        const c = typeof(other) == 'number' ? other : other.realPart;
        const d = typeof(other) == 'number' ? 0 : other.imaginaryPart;

        const rho = this.magnitude();
        if (rho == 0) return ZERO_ZERO;

        const theta = Math.atan2(b, a);
        const newRho = c * theta + d * rho.log();
        const t = rho.pow(c) * Math.exp(-d * theta);

        return new BigComplexNumber(t * Math.cos(newRho), t * Math.sin(newRho));
    }

    ln() {
        return new BigComplexNumber(this.realPart.abs().log(), this.arg());
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
        return ONE_ZERO.sub(this.pow(2)).sqrt().add(ZERO_ONE.mul(this)).ln().mul(ZERO_NEGATIVE_ONE);
    }

    sqrt() {
        return this.pow(POINT_FIVE_ZERO);
    }

    cbrt() {
        return this.pow(POINT_THREE_REPEATING_ZERO);
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

    toLatexString() {
        const manualToString = (value) => {
            if (typeof(value) == 'number') value = Math.round(value * 100) / 100; else value = (value * 100).round() / 100;
            if (Math.abs(value) <= 0.001) {
                return `0`;
            }
            return value.toString(2, 2, Rounding.NEAREST);
        }

        let result = manualToString(this.realPart);
        if (this.imaginaryPart >= 0) result += `+`;
        result += manualToString(this.imaginaryPart);
        result += `i`;
        return result;
    }

    stringify() {
        return `${this.realPart.toBase64String()} ${this.imaginaryPart.toBase64String()}`;
    }

    static fromStringified(string) {
        const split = string.split(' ');
        const rp = BigNumber.fromBase64String(split[0]);
        const ip = BigNumber.fromBase64String(split[1]);
        return new BigComplexNumber(rp, ip);
    }
}

var id = "roots_of_polynomial";
var name = "Roots of Polynomial";
var description = "A basic theory.";
var authors = "BasicallyIAmFox";
var version = 1;

var currency;
var quaternaryEntries;
var computedRoots, sortedRoots, recomputeRoots;
var polynomialDegree;
var rhodot;

// Balancing
var pubPower = 0.1;
var tauRate = 0.4;
var pubExp = pubPower / tauRate;
var getTau = () => currency.value.pow(tauRate);
var getPublicationMultiplier = (tau) => tau.pow(pubExp);
var getPublicationMultiplierFormula = (symbol) => `${symbol}^{${pubExp}}`;

// Regular Upgrades
var a0;
var a0Cost = new FirstFreeCost(new ExponentialCost(10, Math.log2(15)));
var getA0Desc = (level) => Utils.getMath(level == 0 ? `a_0=0` : `a_0=-2^{${(Utils.getStepwisePowerSum(level, 2, 6, 0) - 1).toString(0)}}`);
var getA0Info = (level, amount) => Utils.getMathTo(level == 0 ? `a_0=0` : `a_0=${getA0(level).toString(0)}`, `a_0=${getA0(level + amount).toString(0)}`);
var getA0 = (level) => level == 0 ? BigNumber.ZERO : -BigNumber.TWO.pow(Utils.getStepwisePowerSum(level, 2, 6, 0) - 1);

var a1;
var a1Cost = new ExponentialCost(50, Math.log2(3));
var getA1Desc = (level) => Utils.getMath(`a_1=${getA1(level).toString(0)}`);
var getA1Info = (level, amount) => Utils.getMathTo(`a_1=${getA1(level).toString(0)}`, `a_1=${getA1(level + amount).toString(0)}`);
var getA1 = (level) => Utils.getStepwisePowerSum(level, 3, 2, 1);

var a2;
var a2Cost = new ExponentialCost(25, Math.log2(30));
var getA2Desc = (level) => Utils.getMath(level == 0 ? `a_2=0` : `a_2=2^{-${level}}`);
var getA2Info = (level, amount) => Utils.getMathTo(level == 0 ? `a_2=0` : `a_2=1/${(BigNumber.ONE / getA2(level)).toString(0)}`, `a_2=1/${(BigNumber.ONE / getA2(level + amount)).toString(0)}`);
var getA2 = (level) => level == 0 ? BigNumber.ZERO : BigNumber.TWO.pow(-level);

var a3;
var a3Cost = new ExponentialCost(1000, Math.log2(60));
var getA3Desc = (level) => Utils.getMath(level == 0 ? `a_3=0` : `a_3=0.075 \\cdot 2^{-${level}}`);
var getA3Info = (level, amount) => Utils.getMathTo(level == 0 ? `a_3=0` : `a_3=1/${(BigNumber.ONE / getA3(level) * 0.075).toString(2)}`, `a_3=1/${(BigNumber.ONE / getA3(level + amount) * 0.075).toString(2)}`)
var getA3 = (level) => level == 0 ? BigNumber.ZERO : 0.075 * BigNumber.TWO.pow(-level);

var a4;
var a4Cost = new ExponentialCost(BigNumber.from("1e125"), BigNumber.from("1.25e25").log2());
var getA4 = (level) => BigNumber.from(level).pow(0.5) / 8;

var a5;
var a5Cost = new ExponentialCost(BigNumber.from("1e500"), BigNumber.from("5e100").log2());
var getA5 = (level) => BigNumber.from(level).pow(0.25) / 16;

// Permanent Upgrades
var maxPolynomialDegreePerma;
var a4HypopMs, a5HypopMs;

// Checkpoint Upgrades
var milestoneCost = new CustomCost(level => {
    return BigNumber.from(25 * level);
});

const ZERO_NEGATIVE_ONE = new BigComplexNumber(0, -1);
const ZERO_ZERO = new BigComplexNumber(0, 0);
const ZERO_ONE = new BigComplexNumber(0, 1);
const POINT_THREE_REPEATING_ZERO = new BigComplexNumber(1.0 / 3.0, 0);
const POINT_FIVE_ZERO = new BigComplexNumber(0.5, 0);
const ONE_ZERO = new BigComplexNumber(1, 0);
const E_ZERO = new BigComplexNumber(Math.E, 0);
const PRIMITIVE_CBRT_OF_UNITY = BigComplexNumber.fromReal(-3).sqrt().sub(1).div(2);

const rootSolvers = [
    (_) => { throw new Error() },
    (coefficients) => { // Bx^1 + A = 0
        const A = coefficients[1];
        const B = coefficients[0];

        return [ (A != 0) ? BigComplexNumber.fromReal(-B / A) : ZERO_ZERO ];
    },
    (coefficients) => { // Cx^2 + Bx^1 + A = 0
        const A = coefficients[2];
        const B = coefficients[1];
        const C = coefficients[0];

        const discriminant = BigComplexNumber.fromReal((B * B - 4 * A * C) / (4 * A * A)).sqrt();
        const term = BigComplexNumber.fromReal(-B / (2 * A));
        return [ term.add(discriminant), term.sub(discriminant) ];
    },
    (coefficients) => { // Dx^3 + Cx^2 + Bx^1 + A = 0
        // Remap the variables.
        // Ax^3 + Bx^2 + Cx^1 + D = 0
        const A = coefficients[3];
        let B = coefficients[2];
        const C = coefficients[1];
        const D = coefficients[0];

        let d0 = B * B - 3 * A * C;
        let d1 = 2 * B * B * B - 9 * A * B * C + 27 * A * A * D;
        if (d0 == 0 && d0 == d1) {
            const root = BigComplexNumber.fromReal(-B / (3 * A));
            return [ root, root, root ];
        } else {
            const cbrt0 = ONE_ZERO;
            const cbrt1 = PRIMITIVE_CBRT_OF_UNITY;
            const cbrt2 = PRIMITIVE_CBRT_OF_UNITY.pow(2);
            d0 = BigComplexNumber.fromReal(d0);
            d1 = BigComplexNumber.fromReal(d1);
            B = BigComplexNumber.fromReal(B);

            const term = BigComplexNumber.fromReal(-1 / (3 * A));
            const c0 = d1.sub(d1.pow(2).sub(d0.pow(3).mul(4)).sqrt()).div(2).cbrt();
            const c1 = c0.mul(cbrt0);
            const c2 = c0.mul(cbrt1);
            const c3 = c0.mul(cbrt2);

            const root1 = c1.reciprocal().mul(d0).add(c1).add(B).mul(term);
            const root2 = c2.reciprocal().mul(d0).add(c2).add(B).mul(term);
            const root3 = c3.reciprocal().mul(d0).add(c3).add(B).mul(term);

            return [ root1, root2, root3 ];
        }
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

            const y = (r.isZero() ? BigComplexNumber.fromReal(q).cbrt().neg() : u.sub(u.mul(3).reciprocal().mul(p))).add(-5 * a / 6);
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
]

var init = () => {
    currency = theory.createCurrency();
    quaternaryEntries = [];

    computedRoots = [ ZERO_ZERO, ZERO_ZERO, ZERO_ZERO, ZERO_ZERO, ZERO_ZERO ];
    sortedRoots = [ 0, 1, 2, 3, 4 ];
    recomputeRoots = true;

    ///////////////////
    // Regular Upgrades

    // a0
    {
        a0 = theory.createUpgrade(0, currency, a0Cost);
        a0.getDescription = (_) => getA0Desc(a0.level);
        a0.getInfo = (amount) => getA0Info(a0.level, amount);
        a0.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 0);
            recomputeRoots = true;
        }
    }

    // a1
    {
        a1 = theory.createUpgrade(1, currency, a1Cost);
        a1.getDescription = (_) => getA1Desc(a1.level);
        a1.getInfo = (amount) => getA1Info(a1.level, amount);
        a1.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 1);
            recomputeRoots = true;
        }
    }

    // a2
    {
        a2 = theory.createUpgrade(2, currency, a2Cost);
        a2.getDescription = (_) => getA2Desc(a2.level);
        a2.getInfo = (amount) => getA2Info(a2.level, amount);
        a2.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 2);
            recomputeRoots = true;
        }
    }

    // a3
    {
        a3 = theory.createUpgrade(3, currency, a3Cost);
        a3.getDescription = (_) => getA3Desc(a3.level);
        a3.getInfo = (amount) => getA3Info(a3.level, a3.level + amount);
        a3.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 3);
            recomputeRoots = true;
        }
    }

    // a4
    {
        let getDesc = (level) => "a_4=" + getA4(level).toString();
        a4 = theory.createUpgrade(4, currency, a4Cost);
        a4.getDescription = (_) => Utils.getMath(getDesc(a4.level));
        a4.getInfo = (amount) => Utils.getMathTo(getDesc(a4.level), getDesc(a4.level + amount));
        a4.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 4);
            recomputeRoots = true;
        }
    }

    // a5
    {
        let getDesc = (level) => "a_5=" + getA5(level).toString();
        a5 = theory.createUpgrade(5, currency, a5Cost);
        a5.getDescription = (_) => Utils.getMath(getDesc(a5.level));
        a5.getInfo = (amount) => Utils.getMathTo(getDesc(a5.level), getDesc(a5.level + amount));
        a5.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            polynomialDegree = Math.max(polynomialDegree, 5);
            recomputeRoots = true;
        }
    }

    ///////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e8);
    theory.createBuyAllUpgrade(1, currency, 1e10);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    {
        maxPolynomialDegreePerma = theory.createPermanentUpgrade(3, currency, new CustomCost(level => {
            if (level == 2) {
                return BigNumber.from("1e5");
            } else if (level == 3) {
                return BigNumber.from("1e125");
            } else if (level == 4) {
                return BigNumber.from("1e500");
            }
            return BigNumber.ZERO;
        }));
        maxPolynomialDegreePerma.getDescription = (_) => `Increase maximum polynomial degree`;
        maxPolynomialDegreePerma.getInfo = (amount) => `Increases maximum polynomial degree to ${maxPolynomialDegreePerma.level + amount}, unlocks new variable${(amount > 1 ? 's' : '')}`;
        maxPolynomialDegreePerma.bought = (_) => updateAvailability();
        maxPolynomialDegreePerma.level = 2;
        maxPolynomialDegreePerma.maxLevel = 5;
    }

    /////////////////////
    // Checkpoint Upgrades
    theory.setMilestoneCost(milestoneCost);

    {
        a4HypopMs = theory.createMilestoneUpgrade(0, 1);
        a4HypopMs.description = `Increase the arithmetic operator power of ${Utils.getMath(`1+x_3`)}`;
        a4HypopMs.getInfo = (_) => {
            const left = a5.level > 0 ? `x_0x_1x_2x_3x_4` : `x_0x_1x_2x_3`;
            const right = a5.level > 0 ? `(x_0x_1x_2x_4)^{1+x_3}` : `(x_0x_1x_2)^{1+x_3}`;
            return Utils.getMathTo(left, right);
        };
        a4HypopMs.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            recomputeRoots = true;
            updateAvailability();
        };
        a4HypopMs.canBeRefunded = (_) => a5HypopMs.level == 0;
    }

    {
        a5HypopMs = theory.createMilestoneUpgrade(1, 2);
        a5HypopMs.description = `Increase the arithmetic operator power of ${Utils.getMath(`1+x_4`)}`;
        a5HypopMs.getInfo = (_) => {
            if (a5HypopMs.level == 0) return Utils.getMathTo(`(x_0x_1x_2x_4)^{1+x_3}`, `(x_0x_1x_2)^{(1+x_3)(1+x_4)}`);
            return Utils.getMathTo(`(x_0x_1x_2)^{(1+x_3)(1+x_4)}`, `(x_0x_1x_2)^{1+x_3} \\uparrow^2 (1+x_4)`);
        };
        a5HypopMs.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            recomputeRoots = true;
            updateAvailability();
        };
    }

    polynomialDegree = getHighestPolynomialDegree();
    updateAvailability();
}

var updateAvailability = () => {
    a3.isAvailable = maxPolynomialDegreePerma.level >= 3;
    a4.isAvailable = maxPolynomialDegreePerma.level >= 4;
    a5.isAvailable = maxPolynomialDegreePerma.level >= 5;

    //a4HypopMs.isAvailable = a4.isAvailable;
    //a5HypopMs.isAvailable = a5.isAvailable && a4HypopMs.level > 0;
}

var tick = (elapsedTime, multiplier) => {
    if (recomputeRoots || polynomialDegree >= 5) {
        computeRoots();
        sortRoots();
        theory.invalidateQuaternaryValues();
        recomputeRoots = false;
    }

    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    rhodot = computedRoots[sortedRoots[0]];
    if (a2.level > 0) rhodot = rhodot.mul(computedRoots[sortedRoots[1]].add(1));
    if (a3.level > 0) rhodot = rhodot.mul(computedRoots[sortedRoots[2]]);
    if (a4.level > 0 && a4HypopMs.level == 0) rhodot = rhodot.mul(computedRoots[sortedRoots[3]]);
    if (a5.level > 0 && a5HypopMs.level == 0) rhodot = rhodot.mul(computedRoots[sortedRoots[4]]);
    if (a4.level > 0 && a4HypopMs.level == 1) rhodot = rhodot.pow(computedRoots[sortedRoots[3]].add(1));
    if (a5.level > 0 && a5HypopMs.level == 1) rhodot = rhodot.pow(computedRoots[sortedRoots[4]].add(1));
    if (a5.level > 0 && a5HypopMs.level == 2 && !rhodot.isZero()) rhodot = E_ZERO.pow(rhodot.ln().pow(computedRoots[sortedRoots[4]].add(1)));
    rhodot = rhodot.magnitude() * bonus;
    currency.value += rhodot * dt;

    theory.invalidateSecondaryEquation();
}

var computeRoots = () => {
    const newRoots = rootSolvers[polynomialDegree]([getA0(a0.level), getA1(a1.level), getA2(a2.level), getA3(a3.level), getA4(a4.level), getA5(a5.level)]);
    computedRoots[0] = computedRoots[1] = computedRoots[2] = computedRoots[3] = computedRoots[4] = ZERO_ZERO;
    for (let i = 0; i < newRoots.length; i++) {
        computedRoots[i] = newRoots[i];
    }
}

var sortRoots = () => {
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

    sortedRoots = [ 0, 1, 2, 3, 4 ];

    if (polynomialDegree >= 5 && a5HypopMs.level >= 1) {
        const goal = ONE_ZERO;
        const leastIndex = reduceIndex(computedRoots, (curr, next) => next.sub(1).sub(goal).compare(curr.sub(1).sub(goal)));
        if (leastIndex != 4) {
            sortedRoots[4] = leastIndex;
            sortedRoots[leastIndex] = 4;
        }
    }

    if (polynomialDegree >= 4 && a4HypopMs.level == 1) {
        const goal = ONE_ZERO;
        const leastIndex = reduceIndex(computedRoots, (curr, next, i) => {
            if (i >= 4) return -1;
            return next.sub(1).sub(goal).compare(curr.sub(1).sub(goal));
        });
        if (leastIndex != 3) {
            sortedRoots[3] = leastIndex;
            sortedRoots[leastIndex] = 3;
        }
    }

    if (polynomialDegree >= 2) {
        let leastIndex = 0;
        if (computedRoots[leastIndex].add(1).abs().compare(computedRoots[1].add(1).abs()) >= 0) leastIndex = 1;
        if (a3.level > 0 && computedRoots[leastIndex].add(1).abs().compare(computedRoots[2].add(1).abs()) >= 0) leastIndex = 2;
        if (a4.level > 0 && a4HypopMs.level == 0 && computedRoots[leastIndex].add(1).abs().compare(computedRoots[3].add(1).abs()) >= 0) leastIndex = 3;
        if (a5.level > 0 && a5HypopMs.level == 0 && computedRoots[leastIndex].add(1).abs().compare(computedRoots[4].add(1).abs()) >= 0) leastIndex = 4;
        if (leastIndex != 1) {
            sortedRoots[1] = leastIndex;
            sortedRoots[leastIndex] = 1;
        }
    }
}

var getInternalState = () => JSON.stringify({
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
    }
});

var setInternalState = (stateStr) => {
    if (!stateStr) return;

    const state = JSON.parse(stateStr);
    polynomialDegree = state.polynomialDegree;
    computedRoots = new Array(5);
    computedRoots[0] = BigComplexNumber.fromStringified(state.computedRoots[0]);
    computedRoots[1] = BigComplexNumber.fromStringified(state.computedRoots[1]);
    computedRoots[2] = BigComplexNumber.fromStringified(state.computedRoots[2]);
    computedRoots[3] = BigComplexNumber.fromStringified(state.computedRoots[3]);
    computedRoots[4] = BigComplexNumber.fromStringified(state.computedRoots[4]);
    sortedRoots = new Array(5);
    sortedRoots[0] = state.sortedRoots[0];
    sortedRoots[1] = state.sortedRoots[1];
    sortedRoots[2] = state.sortedRoots[2];
    sortedRoots[3] = state.sortedRoots[3];
    sortedRoots[4] = state.sortedRoots[4];
}

var postPublish = () => {
    computedRoots = [ ZERO_ZERO, ZERO_ZERO, ZERO_ZERO, ZERO_ZERO, ZERO_ZERO ];
    sortedRoots = [ 0, 1, 2, 3, 4 ];
    recomputeRoots = true;
    polynomialDegree = getHighestPolynomialDegree();
}

var getPrimaryEquation = () => {
    theory.primaryEquationScale = 1.1;
    theory.primaryEquationHeight = 100;

    let result = `\\begin{cases}`;
    result += `P(x)=\\sum_{i=0}^{${polynomialDegree}}{a_ix^i} \\\\`;
    result += `x \\in \\mathbb{C} \\mid P(x) = \\{x_0`;
    for (let i = 1; i < polynomialDegree; i++) {
        result += `,x_${i}`;
    }
    result += `\\} \\\\`;
    result += `\\dot{\\rho} = |`;
    if (a4.level > 0 && a4HypopMs.level == 1 || a5.level > 0 && a5HypopMs.level == 1) result += `(`;
    result += `{x_0`;
    if (a3.level > 0) result += `x_2`;
    if (a2.level > 0) result += `(1+x_1)`;
    if (a4.level > 0 && a4HypopMs.level == 0) result += `x_3`;
    if (a5.level > 0 && a5HypopMs.level == 0) result += `x_4`;
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
    return result;
}

var getSecondaryEquation = () => {
    let result = `\\begin{matrix}`;
    result += `${theory.latexSymbol}=\\max\\rho^{${tauRate}}`;
    result += `,&\\dot{\\rho}=${rhodot.toString()}`;
    result += `\\end{matrix}`
    return result;
}

var getQuaternaryEntries = () => {
    if (quaternaryEntries.length == 0) {
        quaternaryEntries.push(new QuaternaryEntry("x_0", null));
        quaternaryEntries.push(new QuaternaryEntry("x_1", null));
        quaternaryEntries.push(new QuaternaryEntry("x_2", null));
        quaternaryEntries.push(new QuaternaryEntry("x_3", null));
        quaternaryEntries.push(new QuaternaryEntry("x_4", null));
    }

    quaternaryEntries[0].value = a0.level > 0 || a1.level > 0 ? computedRoots[sortedRoots[0]].toLatexString() : null;
    quaternaryEntries[1].value = a2.level > 0 ? computedRoots[sortedRoots[1]].toLatexString() : null;
    quaternaryEntries[2].value = a3.level > 0 ? computedRoots[sortedRoots[2]].toLatexString() : null;
    quaternaryEntries[3].value = a4.level > 0 ? computedRoots[sortedRoots[3]].toLatexString() : null;
    quaternaryEntries[4].value = a5.level > 0 ? computedRoots[sortedRoots[4]].toLatexString() : null;
    return quaternaryEntries;
}

var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();
var getHighestPolynomialDegree = () => {
    if (a5.level > 0) return 5;
    if (a4.level > 0) return 4;
    if (a3.level > 0) return 3;
    if (a2.level > 0) return 2;
    return 1;
}

init();