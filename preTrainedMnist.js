function main() {

    mouseDown = false
    testCharacters = createMnistData_0()
    thisCharacter = new CharacterArray(28, 28, "thisCharacter")
    thisCharacter.setCssClass("characterPixel")
    document.getElementById("thisCharacter").innerHTML = thisCharacter.defineHtmlTable()
    thisCharacter.storeDomElement()

    // set up defaults from html forms
    //var elementsOfNeuralNet = returnElementsOf_MnistClassifier04()
    //mnistBinaryClassifier = reconstituteSavedNeuralNet(elementsOfNeuralNet)

    var elementsOfNeuralNet = returnElementsOf_MnistAnalogClassifier06()
    mnistAnalogClassifier = reconstituteSavedNeuralNet(elementsOfNeuralNet)

    //var elementsOfNeuralNet = returnElementsOf_MnistPredictor02()
    //mnistBinaryPredictor = reconstituteSavedNeuralNet(elementsOfNeuralNet)

    //var elementsOfNeuralNet = returnElementsOf_MnistAnalogPredictor02()
    //mnistAnalogPredictor = reconstituteSavedNeuralNet(elementsOfNeuralNet)

    var testCharacterIndex = Math.floor(Math.random() * testCharacters.length)

    // set the initial repeat interval
    time_interval = 2500;

    // set the character to advance automtaically
    //thisCharacter.changeCharacter(1, testCharacters);
    let numberOfCharactersToAdvanceEachTime = 1
    repeater(numberOfCharactersToAdvanceEachTime);

}

function repeater(incrementor) {

    // see if i can cancel the repeater
    try {
        // stop the automatic advancement
        clearTimeout(timedRepeater);
    } catch (error) {

    }

    // advance the digit
    thisCharacter.changeCharacter(incrementor, testCharacters);

    // create a global variable for the setTimeout
    // milliseconds between digit advances

    timedRepeater = setTimeout(repeater, time_interval, incrementor);
}

function CharacterArray(rows, columns, name) {

    // create a matrix that holds mnist truth and input for calssifier and predictor
    // also the html table representation of the input for a single character

    this.rows = rows;
    this.columns = columns;
    this.matrix = [];
    this.name = name
    this.characterIndex = 0
    this.truth = 0
    this.truthPredictor = new Matrix(1, 1)
    this.truthPredictor.zeroFill();
    this.truthClassifier = new Matrix(10, 1)
    this.truthClassifier.zeroFill();
    this.inputLayerBinary = new mnistDigit(rows, columns)
    this.inputLayerAnalog = new mnistDigit(rows, columns)

    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        this.matrix[rowIndex] = [];

        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            var id = name + "_r" + rowIndex + "c" + columnIndex
            this.matrix[rowIndex][columnIndex] = { "id": id };
        };
    };
};

CharacterArray.prototype.setCssClass = function(cssClass) {
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            this.matrix[rowIndex][columnIndex].cssClass = cssClass
        }
    }
}

CharacterArray.prototype.defineHtmlTable = function(cssClass) {
    var htmlTableDefinition = ''
    var htmlTableDefinitionStart = '<table class="character" ><tbody>'
        //id="thisCharacter" onpointerdown="javascript:setMouseDown();" onpointerup="javascript:setMouseUp();"
    var htmlTableDefinitionEnd = '</tbody></table>'

    htmlTableDefinition = htmlTableDefinitionStart
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        htmlTableDefinition = htmlTableDefinition + "<tr>"
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {

            // <td class="off" id="r5c0" onmouseover="setMouseOver(5,0)"></td>
            var tdElement = '<td class="' + this.matrix[rowIndex][columnIndex].cssClass + '" id=' + this.name + '_r' + rowIndex + 'c' + columnIndex + ' onmouseover="setMouseOver(' + rowIndex + ',' + columnIndex + ')"></td>'
            htmlTableDefinition = htmlTableDefinition + tdElement
        }
        htmlTableDefinition = htmlTableDefinition + "</tr>"
    }
    htmlTableDefinition = htmlTableDefinition + htmlTableDefinitionEnd

    return htmlTableDefinition
}

CharacterArray.prototype.storeDomElement = function() {
    // stores the dom element so that we can get to it quickly and easily
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            var thisId = this.name + "_r" + rowIndex + "c" + columnIndex
            var elementInDom = document.getElementById(thisId)
            this.matrix[rowIndex][columnIndex].elementInDom = elementInDom
        }
    }
}

function setMouseUp() {
    mouseDown = false
    console.log("Mouse now up")

    // we changed the character so we don't know what the truth is any more
    thisCharacter.truth = ""

    // remove the character from the screen and the inputlayer
    document.getElementById("thisCharacterTruth").innerHTML = ""

    // we've finished drawing on the cell so now try to decode what is there
    thisCharacter.decodeCharacter()
}

function setMouseDown() {

    // stop the automatic advancement
    clearTimeout(timedRepeater);

    // set the global mousedown
    mouseDown = true;

    // and shout it
    console.log("Mouse now down");
}

function setMouseOver(r, c) {
    if (mouseDown == true) {

        // arrives here as the mouse pointer touches any cell with the mouse button depressed

        // set the dilation rules
        const dilationRules = [
            { "rowIncrement": 0, "columnIncrement": 0, "weight": 1 },
            { "rowIncrement": -1, "columnIncrement": 0, "weight": 0.3 },
            { "rowIncrement": -1, "columnIncrement": 1, "weight": 0.3 },
            { "rowIncrement": 0, "columnIncrement": 1, "weight": 0.3 },
            { "rowIncrement": 1, "columnIncrement": 1, "weight": 0.3 },
            { "rowIncrement": 1, "columnIncrement": 0, "weight": 0.3 },
            { "rowIncrement": 1, "columnIncrement": -1, "weight": 0.3 },
            { "rowIncrement": 0, "columnIncrement": -1, "weight": 0.3 },
            { "rowIncrement": -1, "columnIncrement": -1, "weight": 0.3 }
        ]

        // loop round the dilation rules applying the point dilation
        for (var dilationRuleIndex = 0; dilationRuleIndex < dilationRules.length; dilationRuleIndex++) {
            let row = r + dilationRules[dilationRuleIndex].rowIncrement
            let column = c + dilationRules[dilationRuleIndex].columnIncrement
            let inputLayerIndex = 28 * row + column
            let weight = Math.max(dilationRules[dilationRuleIndex].weight, thisCharacter.inputLayerAnalog.pixels.matrix[inputLayerIndex][0])
            let rgb = Math.floor(255 - 255 * weight)

            var colour = 'background-color:rgba(' + rgb + ',' + rgb + ',' + rgb + ', 1);'
            thisCharacter.matrix[row][column].elementInDom.setAttribute("style", colour)

            // now update the input layers to have a 1
            thisCharacter.inputLayerBinary.pixels.matrix[inputLayerIndex][0] = 1
            thisCharacter.inputLayerAnalog.pixels.matrix[inputLayerIndex][0] = weight
        }
    }
}

CharacterArray.prototype.clearCharacter = function() {

    // stop the automatic advancement
    clearTimeout(timedRepeater);

    // clear the screen down
    document.getElementById("thisCharacterTruth").innerHTML = ""
    document.getElementById("thisCharacterPrediction").innerHTML = ""
    document.getElementById("thisCharacterClassification").innerHTML = ""
    document.getElementById("thisCharacterClassificationAnalog").innerHTML = ""

    // set the screen colour as we don't know the truth
    document.getElementById("thisCharacterClassificationTd").classList.remove("correct", "inCorrect", "close")
    document.getElementById("thisCharacterPredictionTd").classList.remove("correct", "inCorrect", "close")
    document.getElementById("thisCharacterClassificationAnalogTd").classList.remove("correct", "inCorrect", "close")

    // reset the truth 
    this.truth = ""


    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            // this.matrix[rowIndex][columnIndex].elementInDom.classList.remove("on")
            var inputLayerIndex = 28 * rowIndex + columnIndex

            // set the binary input layer
            thisCharacter.inputLayerBinary.pixels.matrix[inputLayerIndex][0] = 0.01

            // set the analog input layer
            thisCharacter.inputLayerAnalog.pixels.matrix[inputLayerIndex][0] = 1 / 256
        }
    }
    // then put it on the screen
    this.loadAnalogCharacterToScreen()
}

CharacterArray.prototype.centreCharacter = function() {
    // take the character in the cell and centre it using bounding rectangle
    this.inputLayerAnalog.boundingBoxCentre()

    // then put it on the screen
    this.loadAnalogCharacterToScreen()

    // and decode the character that is there
    this.decodeCharacter()
}

CharacterArray.prototype.centreCharacterCentreOfMass = function() {
    // take the character in the analog input layer in the cell and centre it using centre of mass

    // Centre it
    this.inputLayerAnalog.centreOfMassCentre()

    // then put it on the screen
    this.loadAnalogCharacterToScreen()

    // and decode the character that is there
    this.decodeCharacter()
}

CharacterArray.prototype.getOffsetsToCentre = function() {

    // get the bounds so we can work out the offsets that it needs to move by
    var bounds = this.getBounds()

    // now get the offsets
    var row = Math.floor(0.5 * (this.rows - bounds.maxRow - bounds.minRow))
    var column = Math.floor(0.5 * (this.columns - bounds.maxColumn - bounds.minColumn))

    // put them together
    var offsets = { row, column }

    return offsets
}

CharacterArray.prototype.shiftCharacter = function(offsets) {

    // first create a temporary copy of the old inputLayerBinary matrix
    const inputLayerBinaryCopy = thisCharacter.inputLayerBinary.pixels.matrix.map(a => ({...a }));
    const inputLayerAnalogCopy = thisCharacter.inputLayerAnalog.pixels.matrix.map(a => ({...a }));

    // now clear the character cell
    this.clearCharacter()

    // Get the correct inputLayerCopyRowIndex and inputLayerCopyColumnIndex to start and end at 
    var startRowIndex = Math.max(0, 0 - offsets.row)
    var endRowIndex = Math.min(this.rows, this.rows - offsets.row)
    var startColumnIndex = Math.max(0, 0 - offsets.column)
    var endColumnIndex = Math.min(this.columns, this.columns - offsets.column)

    // Loop over the inputLayerBinaryCopy
    // remember that the input layer is a 1 dimensional array that we're treating like a 2d
    for (var inputLayerCopyRowIndex = startRowIndex; inputLayerCopyRowIndex < endRowIndex; inputLayerCopyRowIndex++) {

        for (var inputLayerCopyColumnIndex = startColumnIndex; inputLayerCopyColumnIndex < endColumnIndex; inputLayerCopyColumnIndex++) {

            var inputLayerCopyIndex = this.columns * inputLayerCopyRowIndex + inputLayerCopyColumnIndex
            var inputLayerIndex = this.columns * (inputLayerCopyRowIndex + offsets.row) + inputLayerCopyColumnIndex + offsets.column

            this.inputLayerBinary.pixels.matrix[inputLayerIndex][0] = inputLayerBinaryCopy[inputLayerCopyIndex][0]
            this.inputLayerAnalog.pixels.matrix[inputLayerIndex][0] = inputLayerAnalogCopy[inputLayerCopyIndex][0]

        }
    }
}

CharacterArray.prototype.getBounds = function() {

    // get the min and max row and column used
    var minRow = 999
    var maxRow = 0
    var minColumn = 999
    var maxColumn = 0

    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            if (this.inputLayerBinary.pixels.matrix[rowIndex * this.rows + columnIndex] > 0.01) {
                if (rowIndex < minRow) {
                    minRow = rowIndex
                }
                if (rowIndex > maxRow) {
                    maxRow = rowIndex
                }

                if (columnIndex < minColumn) {
                    minColumn = columnIndex
                }
                if (columnIndex > maxColumn) {
                    maxColumn = columnIndex
                }
            }
        }
    }
    return { minRow, maxRow, minColumn, maxColumn }
}

CharacterArray.prototype.changeCharacter = function(indexIncrement, characters) {

    // called directly from HTML Button 
    // go forwards or backwards depending on the value of the indexIncrement
    // roll over correctly at beginning or end

    // needs to get the correct character out of testCharacters 
    // set the truth
    // load it into the binary input layer 
    // load it into the analog input layer
    // display the analog or digital one onto the screen 
    this.characterIndex = this.characterIndex + indexIncrement
    if (this.characterIndex < 0) {
        this.characterIndex = characters.length - 1
    }
    if (this.characterIndex >= characters.length) {
        this.characterIndex = 0
    }

    // set the truth
    this.truth = characters[this.characterIndex].digit

    // load the truth onto the screen 
    document.getElementById("thisCharacterTruth").innerHTML = this.truth

    // get the array
    var pixelArray784 = characters[this.characterIndex].P

    // load the character into the binary and analog inputlayers
    this.loadCharacterToInputLayers(pixelArray784)

    // load the analog character onto the screen
    thisCharacter.loadAnalogCharacterToScreen()

    // and decode the character that is there
    this.decodeCharacter()

}

CharacterArray.prototype.decodeCharacter = function() {

    // and do the analogClassification
    mnistAnalogClassifier.forwardPropagateAllLayers(thisCharacter.inputLayerAnalog.pixels)
    var analogClassification = mnistAnalogClassifier.outputLayerActivated.max().row

    // set the screen colour indicator if analogClassification == truth
    document.getElementById("thisCharacterClassificationAnalogTd").classList.remove("correct", "inCorrect", "close")
    if (typeof(this.truth) == "number") {
        // and update the tried
        mnistAnalogClassifier.tried++;

        if (this.truth == analogClassification) {
            document.getElementById("thisCharacterClassificationAnalogTd").classList.add("correct");
            // and update the correct 
            mnistAnalogClassifier.correct++;

        } else {
            document.getElementById("thisCharacterClassificationAnalogTd").classList.add("inCorrect")
        }
        // and update the score for this classifier
        var percentageCorrect = (100 * mnistAnalogClassifier.correct / mnistAnalogClassifier.tried);
        document.getElementById("analogClassifierPercentageCorrect").innerText = percentageCorrect.toFixed(1) + "%";

    }



    // and put the result onto the screen
    document.getElementById("thisCharacterClassificationAnalog").innerHTML = analogClassification

}

CharacterArray.prototype.loadCharacterToInputLayers = function(pixelArray784) {

    var pixelIndex = 0
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {

            // pull this pixel out 
            var thisPixel = pixelArray784[pixelIndex]

            if (thisPixel > 1) {
                // this.matrix[rowIndex][columnIndex].elementInDom.classList.add("on")
                this.inputLayerBinary.pixels.matrix[pixelIndex][0] = 1
            } else {
                this.inputLayerBinary.pixels.matrix[pixelIndex][0] = 0.01
            }

            // now the analog version
            // data means that 255 is black rather than white so reverse it
            // then we normalise and avoid zeros by using 256 when max value of thisPixel is 255
            // now normalise but slightly differently so there are no zeros
            // this.inputLayerAnalog.pixels.matrix[pixelIndex][0] = (thisPixel + 1) / 256
            this.inputLayerAnalog.pixels.matrix[pixelIndex][0] = thisPixel

            pixelIndex = pixelIndex + 1
        }
    }
    var youCanBreakHere = true
    this.inputLayerAnalog.pixels.matrix = centreAndNormaliseMnistInputLayer(this.inputLayerAnalog.pixels.matrix)
    var youCanBreakHere = true
}
CharacterArray.prototype.loadBinaryCharacterToScreen = function() {

    // shout out
    console.log("in loadBinaryCharacterToScreen")

    var pixelIndex = 0
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            // make it work with analog input (0 to 255) or binarized input (0.01 or 1)
            if (this.inputLayerBinary.pixels.matrix[pixelIndex] >= 1) {
                var thisPixel = 0

            } else {
                var thisPixel = 255
            }

            // document.getElementById("thisCharacter_r4c6").setAttribute("style", "background-color:rgba(128, 128, 128, 1);")

            // set the coulour of the cell
            var colour = 'background-color:rgba(' + thisPixel + ',' + thisPixel + ',' + thisPixel + ', 1);'
            this.matrix[rowIndex][columnIndex].elementInDom.setAttribute("style", colour)
                // this.matrix[rowIndex][columnIndex].elementInDom.classList.remove("on")
                // if (thisPixel >= 1) {
                //     this.matrix[rowIndex][columnIndex].elementInDom.classList.add("on")
                // } else {
                //     this.matrix[rowIndex][columnIndex].elementInDom.classList.remove("on")
                // }
            pixelIndex = pixelIndex + 1
        }
    }
}

CharacterArray.prototype.loadAnalogCharacterToScreen = function() {

    // shout out
    console.log("in loadAnalogCharacterToScreen")

    var pixelIndex = 0
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            // make it work with analog input (0 to 255) or binarized input (0.01 or 1)
            var thisValue = this.inputLayerAnalog.pixels.matrix[pixelIndex]
            var thisPixel = Math.floor((1 - thisValue) * 255)

            // document.getElementById("thisCharacter_r4c6").setAttribute("style", "background-color:rgba(128, 128, 128, 1);")

            // set the coulour of the cell
            var colour = 'background-color:rgba(' + thisPixel + ',' + thisPixel + ',' + thisPixel + ', 1);'
            this.matrix[rowIndex][columnIndex].elementInDom.setAttribute("style", colour)
                // this.matrix[rowIndex][columnIndex].elementInDom.classList.remove("on")

            pixelIndex = pixelIndex + 1
        }
    }
}

function loadMnistPredictor(dropSelector) {

    // There are a number of pre trained models so load the chosen one    

    if (dropSelector.value == "mnistBinaryPredictor") {
        var elementsOfNeuralNet = returnElementsOf_MnistPredictor()
        mnistBinaryPredictor = reconstituteSavedNeuralNet(elementsOfNeuralNet)
    }
    if (dropSelector.value == "mnistPredictor02") {
        var elementsOfNeuralNet = returnElementsOf_MnistPredictor02()
        mnistBinaryPredictor = reconstituteSavedNeuralNet(elementsOfNeuralNet)
    }

}

function loadMnistClassifier(dropSelector) {

    // There are a number of pre trained models so load the chosen one    

    if (dropSelector.value == "mnistClassifier01") {
        var elementsOfNeuralNet = returnElementsOf_MnistClassifier01()
        mnistBinaryClassifier = reconstituteSavedNeuralNet(elementsOfNeuralNet)
    }
    if (dropSelector.value == "mnistClassifier02") {
        var elementsOfNeuralNet = returnElementsOf_MnistClassifier02()
        mnistBinaryClassifier = reconstituteSavedNeuralNet(elementsOfNeuralNet)
    }
}