function mnistDigit(rows, columns) {
    this.rows = rows
    this.columns = columns
    this.pixels = new Matrix(rows * columns, 1)
    this.pixels.zeroFill();
}

mnistDigit.prototype.shiftCharacter = function(offsets) {

    // first create a temporary copy of the old inputLayerBinary matrix
    const inputLayerAnalogCopy = this.pixels.matrix.map(a => ({...a }));

    // now clear the character cell
    this.pixels.multiply(0)

    // put a 1 in as default
    this.pixels.add(0)

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

            this.pixels.matrix[inputLayerIndex][0] = inputLayerAnalogCopy[inputLayerCopyIndex][0]

        }
    }
}
mnistDigit.prototype.getOffsetsToCentre = function() {

    // get the bounds so we can work out the offsets that it needs to move by
    var bounds = this.getBounds()

    // now get the offsets
    var row = Math.floor(0.5 * (this.rows - bounds.maxRow - bounds.minRow))
    var column = Math.floor(0.5 * (this.columns - bounds.maxColumn - bounds.minColumn))

    // put them together
    var offsets = { row, column }

    return offsets
}

mnistDigit.prototype.getBounds = function() {

    // get the min and max row and column used
    var minRow = 999
    var maxRow = 0
    var minColumn = 999
    var maxColumn = 0

    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            if (this.pixels.matrix[rowIndex * this.rows + columnIndex] > 1 / 255) { // 1/255 is the lowest value in the input layer to avoid multiply by zero and weights disaperaing
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

mnistDigit.prototype.boundingBoxCentre = function() {
    var offsets = this.getOffsetsToCentre()
    this.shiftCharacter(offsets)
}

function centreAndNormaliseMnistInputLayer(inputLayerMatrix) {

    // this takes a huge input layer (or just one example in an input layer) and 
    // column by column, puts the 784 into a mnistCharacter object 
    // then uses that to centre it 
    // then normalise it 

    // each examples as column
    // each row as pixel

    // shout out 
    console.log("About to normalise then centre by centre of mass")

    const numberOfPixels = inputLayerMatrix.length
    const numberOfExamples = inputLayerMatrix[0].length

    // create a new mnistCharacter then load up each example into it, normalise and centre then reload
    var theMnistCharacter = new mnistDigit(28, 28)

    // so loop over each column
    for (var exampleIndex = 0; exampleIndex < numberOfExamples; exampleIndex++) {
        for (var pixelIndex = 0; pixelIndex < numberOfPixels; pixelIndex++) {

            theMnistCharacter.pixels.matrix[pixelIndex][0] = inputLayerMatrix[pixelIndex][exampleIndex]
        }

        // now normalise but slightly differently so there are no zeros
        theMnistCharacter.pixels.add(1)
        theMnistCharacter.pixels.multiply(1.0 / 256)

        // now centre based on centre of mass 
        // it must be normalised first as the centre of mass algo treats 1/256 as zero weight
        // anything above as weight of 1
        theMnistCharacter.centreOfMassCentre()

        // now put it back in the inputLayer
        for (var pixelIndex = 0; pixelIndex < numberOfPixels; pixelIndex++) {
            inputLayerMatrix[pixelIndex][exampleIndex] = theMnistCharacter.pixels.matrix[pixelIndex][0]
        }
    }

    // shout out 
    console.log("Just normalised then centred by centre of mass")

    // even though the inputLayerMatrix is an object so will be amended in place, 
    // I find it confusing so prefer to return it explicitly
    // I do not believe this has any adverse effect on performance 
    // because it's only a interpreted as a reference 
    return inputLayerMatrix
}

mnistDigit.prototype.findCentreOfMass = function() {

    // it ignores the weight of the pixels and just assumes that pixels are 
    //on or off

    let momentRow = 0
    let momentColumn = 0
    let mass = 0
    let thisMass = 1.0

    for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (let columnIndex = 0; columnIndex < this.columns; columnIndex++) {

            if (this.pixels.matrix[rowIndex * this.rows + columnIndex][0] > 1 / 256) {
                momentRow = momentRow + (rowIndex + 0) * thisMass
                momentColumn = momentColumn + (columnIndex + 0) * thisMass
                mass = mass + thisMass
            }
        }
    }
    var row = momentRow / mass
    var column = momentColumn / mass

    centreOfMass = { row, column }

    return centreOfMass
}

mnistDigit.prototype.getOffsetsToCentreOfMass = function() {

    // get the bounds so we can work out the offsets that it needs to move by
    var centreOfMass = this.findCentreOfMass()

    // now get the offsets
    var row = Math.floor((0.5 + this.rows) / 2 - centreOfMass.row)
    var column = Math.floor((0.5 + this.columns) / 2 - centreOfMass.column)

    // put them together
    var offsets = { row, column }

    return offsets
}

mnistDigit.prototype.centreOfMassCentre = function() {
    var offsets = this.getOffsetsToCentreOfMass()
    this.shiftCharacter(offsets)
}