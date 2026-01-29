import { global } from "../../Sim/main";
import theoryClass from "../theory";
import Variable from "../../Utils/variable";
import { ExponentialValue, StepwisePowerSumValue } from "../../Utils/value";
import { ExponentialCost, FirstFreeCost } from '../../Utils/cost';
import { l10, toCallables, parseLog10String, binaryInsertionSearch, add } from "../../Utils/helpers";

export default async function vf(data: theoryData): Promise<simResult> {
  const sim = new vfSim(data);
  const res = await sim.simulate();
  return res;
}

type theory = "VF";

class vfSim extends theoryClass<theory> {
  t_var: number;
  
  getBuyingConditions(): conditionFunction[] {
    const activeStrat = [
      /* tdot */ true,
      /* a1 */ () => this.variables[1].cost + l10(10) < this.variables[2].cost,
      /* b1 */ true,
      /* a2 */ () => this.variables[3].cost + l10(10) < this.variables[4].cost,
      /* b2 */ true,
      /* a3 */ () => this.variables[5].cost + l10(10) < this.variables[6].cost,
      /* b3 */ true,
      /* a4 */ () => this.variables[7].cost + l10(10) < this.variables[8].cost,
      /* b4 */  true,
      /* a5 */ () => this.variables[9].cost + l10(10) < this.variables[10].cost,
      /* b5 */ true
    ];

    const conditions: Record<stratType[theory], (boolean | conditionFunction)[]> = {
      VF: new Array(11).fill(true),
      VFMS: activeStrat
    };
    return toCallables(conditions[this.strat]);
  }
  getVariableAvailability(): conditionFunction[] {
    const conditions: conditionFunction[] = [
      /* tdot*/ () => this.variables[0].level < 4,
      /* a1 */ () => true,
      /* b1 */ () => true,
      /* a2 */ () => true,
      /* b2 */ () => true,
      /* a3 */ () => true,
      /* b3 */ () => this.milestones[1] > 0,
      /* a4 */ () => this.milestones[0] > 0,
      /* b4 */ () => this.milestones[1] > 1,
      /* a5 */ () => this.milestones[0] > 1,
      /* b5 */ () => this.milestones[1] > 2
    ];
    return conditions;
  }
  getTotMult(val: number): number {
    return Math.max(0, val * 0.15 + l10(5));
  }
  getMilestonePriority(): number[] {
    const rho = Math.max(this.lastPub, this.maxRho);

    const ai_points = [20, 45];
    const bi_points = [15, 35, 60];
    const ai_max = binaryInsertionSearch(ai_points, rho);
    const bi_max = binaryInsertionSearch(bi_points, rho);
    this.milestonesMax = [ai_max, bi_max, 5];

    if (this.strat.includes("MS") && rho >= 15 && rho < 300) {
      if (this.ticks % 20 < 10) {
        return [0, 1, 2];
      } else {
        return [0, 2, 1];
      }
    }

    return [0, 2, 1];
  }
  constructor(data: theoryData) {
    super(data);
    this.t_var = 0;
    this.pubUnlock = 10;
    this.milestoneUnlocks = [13, 25, 30, 40, 60, 115, 150, 200, 300];
    this.milestonesMax = [2, 3, 5];
    this.totMult = data.rho < this.pubUnlock ? 0 : this.getTotMult(data.rho);
    this.variables = [
        new Variable({ name: "tdot", cost: new ExponentialCost(1e5, 1e5), valueScaling: new ExponentialValue(10) }),
        new Variable({ name: "a1", cost: new FirstFreeCost(new ExponentialCost(2, 3)), valueScaling: new StepwisePowerSumValue() }),
        new Variable({ name: "b1", cost: new ExponentialCost(1e3, 500), valueScaling: new ExponentialValue(2) }),
        new Variable({ name: "a2", cost: new ExponentialCost(30, 5), valueScaling: new StepwisePowerSumValue() }),
        new Variable({ name: "b2", cost: new ExponentialCost(1e3, 550), valueScaling: new ExponentialValue(2) }),
        new Variable({ name: "a3", cost: new ExponentialCost(1e4, 15), valueScaling: new StepwisePowerSumValue() }),
        new Variable({ name: "b3", cost: new ExponentialCost(1e5, 600), valueScaling: new ExponentialValue(2) }),
        new Variable({ name: "a4", cost: new ExponentialCost(1e20, 35), valueScaling: new StepwisePowerSumValue() }),
        new Variable({ name: "b4", cost: new ExponentialCost(1e25, 650), valueScaling: new ExponentialValue(2) }),
        new Variable({ name: "a5", cost: new ExponentialCost(1e45, 90), valueScaling: new StepwisePowerSumValue(0.1) }),
        new Variable({ name: "b5", cost: new ExponentialCost(1e50, 700), valueScaling: new ExponentialValue(2) })
    ];
    this.updateMilestones();
  }
  copyFrom(other: this): void {
    super.copyFrom(other);
    this.milestones = { ...other.milestones };
    this.curMult = other.curMult;
    this.t_var = other.t_var;
  }
  copy(): vfSim {
    let newsim = new vfSim(this.getDataForCopy());
    newsim.copyFrom(this);
    return newsim;
  }
  async simulate(): Promise<simResult> {
    while (!this.endSimulation()) {
      if (!global.simulating) break;
      this.tick();
      this.updateSimStatus();
      this.updateMilestones();
      this.buyVariables();
    }
    this.trimBoughtVars();
    return this.createResult();
  }
  tick() {
    const aiExp = 1 + 0.03 * this.milestones[2];
    let r0 = this.variables[1].value * aiExp + this.variables[2].value;
    let r1 = this.variables[3].value * aiExp + this.variables[4].value;
    let r2 = this.variables[5].value * aiExp;
    if (this.milestones[1] > 0) r2 += this.variables[6].value;
    let r3 = this.variables[7].value * aiExp;
    if (this.milestones[1] > 1) r3 += this.variables[8].value;
    let r4 = this.variables[9].value * aiExp;
    if (this.milestones[1] > 2) r4 += this.variables[10].value;

    let e0 = 0, e1 = 0, e2 = 0, e3 = 0, e4 = 0;
    if (this.milestones[0] > 1 && this.variables[9].level > 0) {
        e0 = add(r0, r1, r2, r3, r4);
        e1 = add(r0 + add(r1, r2, r3, r4), r1 + add(r2, r3, r4), r2 + add(r3, r4), r3 + r4);
        e2 = add(r0 + add(r1 + add(r2, r3, r4), r2 + add(r3, r4), add(r3, r4)), r1 + add(r2 + add(r3, r4), r3 + r4), r2 + r3 + r4);
        e3 = add(r0 + add(r1 + add(r2 + add(r3, r4), r3 + r4), r2 + r3 + r4), r1 + r2 + r3 + r4);
        e4 = r0 + r1 + r2 + r3 + r4;
    } else if (this.milestones[0] > 0 && this.variables[7].level > 0) {
        e0 = add(r0, r1, r2, r3);
        e1 = add(r0 + add(r1, r2, r3), r1 + add(r2, r3), r2 + r3);
        e2 = add(r0 + add(r1 + add(r2, r3), r2 + r3), r1 + r2 + r3);
        e3 = r0 + r1 + r2 + r3;
    } else if (this.variables[5].level > 0) {
        e0 = add(r0, r1, r2);
        e1 = add(r0 + add(r1, r2), r1 + r2);
        e1 = r0 + r1 + r2;
    } else if (this.variables[3].level > 0) {
        e0 = add(r0, r1);
        e1 = r0 + r1;
    } else if (this.variables[1].level > 0) {
        e0 = r0;
    }

    this.t_var += (this.variables[0].level / 5 + 0.2) * this.dt;

    const rhodot = this.totMult + l10(this.t_var) + e0*2/2 + e1*2/3 + e2*2/4 + e3*2/5 + e4*2/6;
    this.rho.add(rhodot + l10(this.dt));
  }
}