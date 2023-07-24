import { ExponentialCost, FirstFreeCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";
import { Upgrade } from "./api/Upgrades";
import { Popup } from "../api/ui/Popup";
import { Color } from "../api/ui/properties/Color";
import { ImageSource } from "../api/ui/properties/ImageSource";
import { Thickness } from "../api/ui/properties/Thickness";
import { ui } from "../api/ui/UI"

var id = "other_app_1";
var name = "IdleDysonSwarm";
var description = "Idle Type Game of Other Application.";
var authors = "mie31";
var version = 1;

var currency, money, sienceP;
var bot, Fbot, factory;
var workeraddmulti, researchaddmulti, accelerator, accel;
var partick, ticktotal, deltaT;
var botExp, c2Exp;
var rst;

var achievement1, achievement2;
var chapter1, chapter2;

// #region ConstantPartition
const BotsConst = () => {
    //Functions for Defining Constant Attributes of Bots
    //assigment: Bots Criterion Ratio -> 0.01 - 1.00
}
BotsConst.workermulti = BigNumber.ZERO;
BotsConst.researchmulti = BigNumber.ZERO;
BotsConst.assignment = BigNumber.ZERO;
// #endregion

var initialiseSystem = () =>{
    Fbot = BigNumber.ZERO
    ticktotal = BigNumber.ZERO
    accel = BigNumber.ZERO
    BotsConst.workermulti = 0.1;
    BotsConst.researchmulti = 1.0;
    BotsConst.assignment = 0.50;
}

var init = () => {
    initialiseSystem();
    currency = theory.createCurrency();
    money = theory.createCurrency('$');
    sienceP = theory.createCurrency('Σ');
    //($0.10/s||sp 1.00/s) / each responsible bots
    //ρ0.05 / all bots

    ///////////////////
    // Regular Upgrades

    // bot
    {
        let getDesc = (level) => "B_{ot}=" + getBot(level).toString(0);
        bot = theory.createUpgrade(0, currency, new FreeCost);
        bot.getDescription = (_) => Utils.getMath(getDesc(bot.level));
        bot.getInfo = (amount) => Utils.getMathTo(getDesc(bot.level), bot.level + amount);
    }

    // deltaT
    {
        let getDesc = (level) => "dt=" + Number(partick).toFixed(2);
        deltaT = theory.createUpgrade(1, currency, new FreeCost);
        deltaT.getDescription = (_) => Utils.getMath(getDesc(deltaT.level));
        deltaT.getInfo = (amount) => Utils.getMathTo(getDesc(deltaT.level), Number(partick + amount * 0.01).toFixed(2));
    }

    // factory
    {
        let getDesc = (level) => "F_{actory}=" + level;
        factory = theory.createUpgrade(2, money, new ExponentialCost(1e4, Math.log2(15)));
        factory.getDescription = (_) => Utils.getMath(getDesc(getFactDesc(factory.level)) + "_{Bots}/s");
        factory.getInfo = (amount) => Utils.getMathTo(getDesc(getFactDesc(factory.level)), getFactDesc(factory.level + amount) + "_{Bots}/s");
    }

    // workeraddmulti
    {
        let getDesc = (level) => `\\text{Add ${level} Multiprier Worker Generate Value}`;
    }

    // debug
    {
        let getDesc = (level) => `debug`;
        rst = theory.createUpgrade(99, currency, new FreeCost);
        rst.getDescription = (_) => Utils.getMath(getDesc(rst.level));
        rst.getInfo = (amount) => Utils.getMathTo(rst.level, rst.level + amount);
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    // time accel
    {
        accelerator = theory.createPermanentUpgrade(3, sienceP, new LinearCost(1e50, 0));
        accelerator.maxLevel = 1;
        accelerator.getDescription = (_) => Localization.getUpgradeUnlockDesc("\\text{Time Accelerator}");
        accelerator.getInfo = (_) => Localization.getUpgradeUnlockInfo("\\text{Time Accelerator}");
    }

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(25, 25));

    {
        botExp = theory.createMilestoneUpgrade(0, 3);
        botExp.description = Localization.getUpgradeIncCustomExpDesc("c_1", "0.05");
        botExp.info = Localization.getUpgradeIncCustomExpInfo("c_1", "0.05");
        botExp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    /*{
        c2Exp = theory.createMilestoneUpgrade(1, 3);
        c2Exp.description = Localization.getUpgradeIncCustomExpDesc("c_2", "0.05");
        c2Exp.info = Localization.getUpgradeIncCustomExpInfo("c_2", "0.05");
        c2Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }*/
    /*
    /////////////////
    //// Achievements
    achievement1 = theory.createAchievement(0, "Achievement 1", "Description 1", () => bot.level > 1);
    achievement2 = theory.createSecretAchievement(1, "Achievement 2", "Description 2", "Maybe you should buy two levels of c2?", () => c2.level > 1);

    ///////////////////
    //// Story chapters
    chapter1 = theory.createStoryChapter(0, "My First Chapter", "This is line 1,\nand this is line 2.\n\nNice.", () => bot.level > 0);
    chapter2 = theory.createStoryChapter(1, "My Second Chapter", "This is line 1 again,\nand this is line 2... again.\n\nNice again.", () => c2.level > 0);*/

    //updateAvailability();
}

// bots assignment slider
const createSubmenu = () => {
    let assignment;
    let assignmentRatio = (value) => `Worker\\ : \\ `;
    let menu = ui.createPopup({
        title: "Sub Menu",
        context: ui.createStackLayout({
            children: [
                ui.createLabel({text: "Bots Assignment"}),
                assignment = ui.createSlider({
                    onValueChanged: () => BotsConst.assignment++,
                }),
            ],
        }),
    });
}

/* conicgames sample
var popup = ui.createPopup({
    title: "My Popup",
    content: ui.createStackLayout({
        children: [
            ui.createButton({text: "My Button", horizontalOptions: LayoutOptions.START}),
            ui.createCheckBox(),
            ui.createEntry(),
            ui.createFrame({
                heightRequest: 50,
                cornerRadius: 10,
                content: ui.createLabel({
                    text: "A frame.",
                    horizontalOptions: LayoutOptions.CENTER,
                    verticalOptions: LayoutOptions.CENTER
                })
            }),
            ui.createGrid({
                columnDefinitions: ["20*", "30*", "auto"],
                children: [
                    ui.createButton({text: "left", row: 0, column: 0}),
                    ui.createButton({text: "center", row: 0, column: 1}),
                    ui.createButton({text: "right", row: 0, column: 2, padding: new Thickness(0)})
                ]
            }),
            ui.createImage({source: ImageSource.ACCELERATE}),
            ui.createLabel({text: "My label."}),
            ui.createLatexLabel({text: "My LaTeX label. \\(\\int_0^1{xdx}\\)"}),
            ui.createProgressBar({progress: 0.25}),
            ui.createSwitch(),
            ui.createBox({heightRequest: 1, margin: new Thickness(0, 10)}),
            ui.createButton({text: "Close", onClicked: () => popup.hide()})
        ]
    })
});
*/

/* Creaters sample
    const createAutoKickerMenu = () => {
    let amplitudeText = "Amplitude of T: ";
    let frequencyText = "Frequency in seconds: ";
    let amplitudeLabel, frequencyLabel;
    let amplitudeSlider, frequencySlider;
    let menu = ui.createPopup({
      title: "Temperature Adjuster",
      content: ui.createStackLayout({
        children: [
          amplitudeLabel = ui.createLabel({ text: amplitudeText + amplitude.toPrecision(3) }),
          amplitudeSlider = ui.createSlider({
            onValueChanged: () => amplitudeLabel.text = amplitudeText + amplitudeSlider.value.toPrecision(3),
          }),
          frequencyLabel = ui.createLabel({ text: frequencyText + frequency.toPrecision(3) }),
          frequencySlider = ui.createSlider({
            onValueChanged: () => frequencyLabel.text = frequencyText + frequencySlider.value.toPrecision(3),
          }),
          ui.createLabel({ text: "Off/On" }),
          autoKickerSwitch = ui.createSwitch({
            isToggled: () => autoKickerEnabled,
            onTouched: (e) => { if (e.type == TouchType.PRESSED) autoKickerEnabled = !autoKickerEnabled }
          }),
          maxTdotLabel = ui.createLatexLabel({ text: maxTdotText + maximumPublicationTdot.toString() }),
          cycleEstimateLabel = ui.createLatexLabel({ text: cycleEstimateText + cycleEstimate.toString() }),
          rEstimateLabel = ui.createLatexLabel({ text: rEstimateText + rEstimate.toString() }),
          rhoEstimateLabel = ui.createLatexLabel({ text: rhoEstimateText + rhoEstimate.toString() }),
          ui.createButton({
            text: "Update",
            onClicked: () => {
              amplitude = amplitudeSlider.value;
              frequency = frequencySlider.value
            }
          }),
        ]
      })
    })
    amplitudeSlider.maximum = Th;
    amplitudeSlider.minimum = Tc;
    amplitudeSlider.value = amplitude;
    frequencySlider.maximum = 60;
    frequencySlider.minimum = 1;
    frequencySlider.value = frequency;
    return menu;
}*/


/*var updateAvailability = () => {
    c2Exp.isAvailable = botExp.level > 1;
}*/

var resetStage = () => {
    Fbot = BigNumber.ZERO
    initialiseSystem();
}


var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    let botmlt = BotsConst.workermulti;
    let resmlt = BotsConst.researchmulti;
    let botass = BotsConst.assignment;
    let resass = 1 - BotsConst.assignment;

    partick = BigNumber.from((dt + getDeltaT(deltaT.level) + accel) * bonus);
    currency.value += partick * getBot(bot.level).pow(getbotExponent(botExp.level)) * 0.05;
    money.value += partick * (getBot(bot.level).pow(getbotExponent(botExp.level)) * botmlt * botass);
    sienceP.value += partick * (getBot(bot.level).pow(getbotExponent(botExp.level)) * resmlt * resass);
    Fbot += partick * getFactory(factory.level);
    ticktotal += partick;
    if (accelerator.level >= 1) {
        accel += 0.01
    }

    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
}

var getPrimaryEquation = () => {
    theory.primaryEquationHeight = 100;
    theory.primaryEquationScale = 1.125;
    let result = "\\\\ \\left. \\begin{array}{c} Each\\ Equipment \\\\ Producing \\end{array} \\right.";
    result += "\\left\\{ \\begin{array}{cl} $(t) = " + (BotsConst.workermulti * BotsConst.assignment).toFixed(2) + "B_W \\\\ \\Sigma(t) = " + (BotsConst.researchmulti.toFixed(2) * (1 - BotsConst.assignment)).toFixed(2) + "B_R \\end{array} \\right.";
    return result;
}

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 50;
    theory.secondaryEquationScale = 0.95;
    let botmlt = BotsConst.workermulti * BotsConst.assignment;
    let resmlt = BotsConst.researchmulti * (1 - BotsConst.assignment);
    let result = "\\begin{matrix}";
    result += theory.latexSymbol + "=\\max\\rho ^ {0.33}";
    result += `\\\\ Works:${partick * 10 * getBot(bot.level) * botmlt} _$ /s`;
    result += `\\\\ Research:${partick * 10 * getBot(bot.level) * resmlt} _\\Sigma /s`;
    result += "\\end{matrix}";
    return result;
}

var getTertiaryEquation = () => {
    let result = `t_${theory.latexSymbol}=${ticktotal}\\ ^{_{<-}}\\ ${partick}/t`;
    return result;
}

var getPublicationMultiplier = (tau) => tau.pow(0.164);
var getPublicationMultiplierFormula = (symbol) => "{" + symbol + "}^{0.164}";
var getTau = () => BigNumber.from(currency.value.pow(0.33));
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getBot = (level) => BigNumber.from(level + Fbot);
var getDeltaT = (level) => BigNumber.from(0.01 * level);
var getFactory = (level) => BigNumber.from(0.01 * level);   //Bot Generate 0.01 / tick
var getFactDesc = (level) => Number(0.1 * level * partick).toFixed(2);
var getbotExponent = (level) => BigNumber.from(1 + 0.05 * level);
var postPublish = () => {
    initialiseSystem();
    theory.invalidatePrimaryEquation();
    theory.invalidateTertiaryEquation();
}

init();

/*
amplitudeSlider = ui.createSlider({
            onValueChanged: () => amplitudeLabel.text = amplitudeText + amplitudeSlider.value.toPrecision(3),
          }),
{
    let getDesc = (level) => "c_1=" + getC1(level).toString(0);
    c1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(15, Math.log2(2))));
    c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
    c1.getInfo = (amount) => Utils.getMathTo(getDesc(c1.level), getDesc(c1.level + amount));
}

    result += "\\dot{\\rho} = c_1";

    if (botExp.level == 1) result += "^{1.05}";
    if (botExp.level == 2) result += "^{1.1}";
    if (botExp.level == 3) result += "^{1.15}";

    result += "c_2";

    if (c2Exp.level == 1) result += "^{1.05}";
    if (c2Exp.level == 2) result += "^{1.1}";
    if (c2Exp.level == 3) result += "^{1.15}";
*/
