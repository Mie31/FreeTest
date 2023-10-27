import { Cost, ExponentialCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";
import { game } from "./api/Game";

// #region
//|=-=-=-=|Setup Section|=-=-=-=|
var id = "ManyX_1";
var name = "Many X";
var description = "Custom create theory.";
var authors = "Mie31";
var version = 1;

var currency;
var dtval;
var deltat, ttlT
var TheoryReset, c1Exp, c2Exp;
var debuginfo = "NotSetDebugInfo";
var debug, debugcurrency, sendtodbg = "NaN";
var x0, xn = [], atmtion_che;
var tau, currMax;
var xMax = 20, xMaxN;
quaternaryEntries = [];

var achievement1, achievement2;
var chapter1, chapter2;
//|=-=-=-=-=-=-=-=-=-=-=-=-=-=-=|
// #endregion

function formatNumber(number, floatdigits) {
    const rounded = Number(number.toFixed(1));  // 小数点以下を1桁に丸める
    const integerPart = Math.floor(rounded);  // 整数部を取得
  
    let formattedNumber = String(integerPart);  // 整数部を文字列に変換
  
    let decimalPart = rounded - integerPart;  // 小数部を取得
    if (decimalPart !== 0) {
      decimalPart *= Math.pow(10, 0);  // 小数部を1桁にするため10倍する
      formattedNumber += '.' + String(decimalPart);
    }

    return formattedNumber;
}

var __init__ = () => {
    deltat = BigNumber.ZERO;
    ttlt = BigNumber.ZERO;
    for (let i = 0; i < xMax; i++){
        xn[i] = BigNumber.ZERO;
        xMaxN = i;
    };
    tau = 1;
}

var resetStage = () => {
    __init__();
}

var postPublish = () => {
    __init__();
    updateEquations(true, true, true, true);
}

var init = () => {
    __init__()
    currency = theory.createCurrency();

    ///////////////////
    // #region Regular Upgrades

    // dtval
    {
        let getDesc = (level) => "dt=" + Number(getDeltaT(level)).toFixed(2);
        dtval = theory.createUpgrade(0, currency, new FreeCost);
        dtval.getDescription = (_) => Utils.getMath(getDesc(dtval.level));
        dtval.getInfo = (amount) => Utils.getMathTo(getDesc(dtval.level), getDesc(dtval.level + 1));
    }

    // debuginfo
    /*
    {
        let getDesc = (level) => `${debuginfo}=${dbg(level).toString(0)}`;
        debug = theory.createUpgrade(2, currency, new FreeCost);
        debug.getDescription = (_) => Utils.getMath(getDesc(debug.level));
        debug.getInfo = (amount) => Utils.getMathTo(getDesc(debug.level), getDesc(debug.level + amount));
    }
    */
    // #endregion

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e50);
    // reset
    {
        TheoryReset = theory.createPermanentUpgrade(1, currency, new FreeCost);
        TheoryReset.getDescription = (_) => Utils.getMath("Theory Reset")
        TheoryReset.maxLevel = 1
        TheoryReset.bought = (_) => theory.reset()
    }
    // x0
    {
        x0 = theory.createPermanentUpgrade(2, currency, new FreeCost);
        let getDesc = (level) => "x_0=" + Number(getX0(level)).toFixed(3);
        x0.getDescription = (_) => Utils.getMath(getDesc(x0.level));
        x0.getInfo = (amount) => Utils.getMathTo(getDesc(x0.level), getDesc(x0.level + 1));
        x0.bought = (_) => updateEquations(false, true, false, false);
    }
    // automation rate cheeting
    /*{
        atmtion_che = theory.createPermanentUpgrade(2, currency, new FreeCost);
        let getDesc = (level) => "rate=" + Number(getATrate(level)).toFixed(1) + "/sec";
        atmtion_che.getDescription = (_) => Utils.getMath(getDesc(atmtion_che.level))
        atmtion_che.getInfo = (amount) => Utils.getMathTo(getDesc(atmtion_che.level), getDesc(atmtion_che.level + 1));
        atmtion_che.bought = (_) => game.automation.rate = getATrate(atmtion_che.level)
    }*/

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(25, 25));

    {
        c1Exp = theory.createMilestoneUpgrade(0, 3);
        c1Exp.description = Localization.getUpgradeIncCustomExpDesc("c_1", "0.05");
        c1Exp.info = Localization.getUpgradeIncCustomExpInfo("c_1", "0.05");
        c1Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    {
        c2Exp = theory.createMilestoneUpgrade(1, 3);
        c2Exp.description = Localization.getUpgradeIncCustomExpDesc("c_2", "0.05");
        c2Exp.info = Localization.getUpgradeIncCustomExpInfo("c_2", "0.05");
        c2Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }
    
    /////////////////
    //// Achievements
    /*achievement1 = theory.createAchievement(0, "Achievement 1", "Description 1", () => c1.level > 1);
    achievement2 = theory.createSecretAchievement(1, "Achievement 2", "Description 2", "Maybe you should buy two levels of c2?", () => c2.level > 1);*/

    ///////////////////
    //// Story chapters
    //chapter1 = theory.createStoryChapter(0, "My First Chapter", "This is line 1,\nand this is line 2.\n\nNice.", () => c1.level > 0);
    //chapter2 = theory.createStoryChapter(1, "My Second Chapter", "This is line 1 again,\nand this is line 2... again.\n\nNice again.", () => c2.level > 0);

    //updateAvailability();
}

//var updateAvailability = () => {}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    deltat = BigNumber.from(getDeltaT(dtval.level));
    ttlT = dt;
    getXn();
    updateEquations(false, true, true, true);
    currency.value += dt * bonus * xn[xMax - 1];
    currMax = dt * xn[xMax - 1]
}

var getPrimaryEquation = () => {
    let result = "\\dot{\\rho} = x_{\\max n}^{dt}";
    return result;
}

var getSecondaryEquation = () => {
    let result = "x_0=" + Number(getX0(x0.level)).toFixed(3) + "\\\\";
    result += "\\Delta" + theory.latexSymbol + "=\\frac{{\\dot\\rho}}{\\sin(x_{\\max n})+x_{\\max n}}";
    return result;
}
theory.secondaryEquationHeight = 50

var getQuaternaryEntries = () => {
    if (quaternaryEntries.length == 0) {
        for (let i = 0; i < xMax; i++) {
            quaternaryEntries.push(new QuaternaryEntry(`x_{${i+1}}`, null));
        }
    }

    for (let i = 0; i < xMax; i++) {
        quaternaryEntries[i].value = BigNumber.from(xn[i]);
    }
    
    return quaternaryEntries;
}

var getTertiaryEquation = () => `t_${theory.latexSymbol}=${ttlT},\\ ${deltat}/t`;

var getPublicationMultiplier = (tau) => tau.pow(0.05) / BigNumber.THREE;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.05}}{3}";
var getTau = () => {
    tau += Number(currMax / (Math.sin(xn[0]) + xn[0]))
    if (tau >= 1) {
        return tau;
    } else {
        tau = 1;
        return 1;
    }
};
var get2DGraphValue = () => Math.log10(Math.log1p(getTau()));

var getN = (level) => formatNumber(level / 100, 2)
var getDT = (level) => formatNumber(level / 10, 1)
var getATrate = (level) => game.automation.rate + level * 0.1;
var dbg = (level) => sendtodbg
/*
let value = level / 10;
let result = value.toPrecision(2);
return result + " s";
*/
var getX0 = (level) => (0.001 * (level+1));
var getDeltaT = (level) => (0.01 * level);
var getXn = () => {
    xn[0] += getX0(x0.level) * getDeltaT(dtval.level);
    updateEquations(false, false, false, true);
    for (let i = 1; i < xMax; i++){
        xn[i] += xn[i-1] * getDeltaT(dtval.level);
        updateEquations(false, false, false, true);
    };
}

var updateEquations = (primary, secondary, tertiary, quaternary) => {
    if (primary) theory.invalidatePrimaryEquation();
    if (secondary) theory.invalidateSecondaryEquation();
    if (tertiary) theory.invalidateTertiaryEquation();
    if (quaternary) theory.invalidateQuaternaryValues();
}

init();
