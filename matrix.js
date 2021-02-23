// This is a handrolled matrix library by PBS 
// I wouldn't really expect anyone to use it 
// I wrote it when I was hand rolling a neural net in JS 
// I find that I only really have a chance of understanding something when I take this approach.

function Matrix(rows, columns) {

    this.rows = rows;
    this.columns = columns;
    this.matrix = [rows];
    this.name = "noneYet"
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        this.matrix[rowIndex] = [columns];
        // this.matrix[rowIndex] = new Float32Array(this.columns) // this is slower!

        // trying it with no itialiastion 
        // Should be quicker
        //for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
        //    this.matrix[rowIndex][columnIndex] = 0;
        //};
    };
};

Matrix.prototype.setValuesFromArray = function(arrayOfValues) {

    // creates a Matrix that can then have all the functions used on it 
    // array must be 2d (means that it has rows and columns, no more or less)
    // it uses the refernce of the array rather than taking a copy 

    // check that the outside thing is an array
    if (!arrayOfValues instanceof Array) {
        // trying to initialise a Matrix with something that is not an Array
        console.log("in setValuesFromArray: trying to initialise a Matrix with something that is not a 2d Array")
        return false
    }

    // check that the inside thing is an array
    if (!arrayOfValues[0] instanceof Array) {
        // trying to initialise a Matrix with something that is not a 2d Array
        console.log("in setValuesFromArray: trying to initialise a Matrix with something that is not a 2d Array")
        return false
    }

    // so on a quick check at least, it seems this is a 2d array
    // let's load it up!
    this.rows = arrayOfValues.length;
    this.columns = arrayOfValues[0].length;
    this.matrix = []

    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        this.matrix[rowIndex] = []
            // this.matrix[rowIndex] = new Float32Array(this.columns)
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            this.matrix[rowIndex][columnIndex] = arrayOfValues[rowIndex][columnIndex]
        }
    }

    // and tell the caller it was successful
    return true

}

Matrix.prototype.add = function(thingToAdd) {

    // let's check to see if the thingToAdd is a matrix itself
    if (thingToAdd instanceof Matrix) {
        // I only allow add if dimensions are the same
        if (this.rows == thingToAdd.rows && this.columns == thingToAdd.columns) {
            for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
                for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
                    var valueToAdd = thingToAdd.matrix[rowIndex][columnIndex] * 1.0
                    var originalValue = this.matrix[rowIndex][columnIndex] * 1.0
                    this.matrix[rowIndex][columnIndex] = originalValue + valueToAdd;
                };
            };
        } else {
            // dimensions are different, no can do
            console.log("Trying to matrix add when dimensions are different")
            return false
        }

    } else {
        // it's not a Matrix so let's do a scalar add
        for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
            for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
                var originalValue = this.matrix[rowIndex][columnIndex] * 1.0
                this.matrix[rowIndex][columnIndex] = originalValue + thingToAdd * 1.0;
            };
        };
    }
};

Matrix.prototype.multiply = function(thingToMultiply) {
    // allows thingToMultiply to be a scalar or a matrix 
    // does in place elementwise multiplication if the thing was a matrix 
    // does in place scalar multiplication if the thing was a scalar 

    if (thingToMultiply instanceof Matrix) {
        // I only allow multiply if dimensions are identical
        if (this.columns == thingToMultiply.columns && this.rows == thingToMultiply.rows) {

            for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
                for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
                    // get the values and their product
                    var originalValue = this.matrix[rowIndex][columnIndex]
                    var multiplier = thingToMultiply.matrix[rowIndex][columnIndex]
                    var product = originalValue * multiplier

                    // and put the product of the values back in
                    this.matrix[rowIndex][columnIndex] = product

                };
            };

        } else {
            // dimensions are incompatible, no can do
            console.log("Trying to matrix multiply when dimensions are incompatible")
            return false
        }

    } else {

        for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
            for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
                var originalValue = this.matrix[rowIndex][columnIndex]
                this.matrix[rowIndex][columnIndex] = originalValue * thingToMultiply;
            };
        };
    };
};


Matrix.prototype.dotMultiply = function(matrixToMultiply) {
    // allows matrixToMultiply to be a scalar or a matrix 
    // returns a new matrix if the thing was a matrix 
    // operates on the original if was a scalar 
    // I'm not all that happy about that but not sure which direction to go atm 
    // todo: get happy

    if (matrixToMultiply instanceof Matrix) {
        // I only allow multiply if dimensions are compatible
        if (this.columns == matrixToMultiply.rows) {
            // right, we're good to go
            // how the bloody hell do we do matrix multiply again???
            // it will have as many rows as the 1st and as many columns as the 2nd 
            // so let's create a new Matrix for the product 
            var productResult = new Matrix(this.rows, matrixToMultiply.columns)
            productResult.name = "dotMultipleOf (" + this.name + ") and (" + matrixToMultiply.name + ")"

            // ok!! Now we're cooking!
            // what next?
            // the result for each location of (row from 1st, column from 2nd)
            // is sum of products of nth entry in each
            // so loop over rows of 1st and cols of 2nd
            // same as looping over rows of product and cols of product
            for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
                for (var columnIndex = 0; columnIndex < matrixToMultiply.columns; columnIndex++) {
                    // create an accumulator
                    var accumulator = 0

                    // now loop over the values in that row for m1 and values in that column 
                    // accumulating the product 
                    for (var elementIndex = 0; elementIndex < this.columns; elementIndex++) {
                        var factor1 = this.matrix[rowIndex][elementIndex]
                        var factor2 = matrixToMultiply.matrix[elementIndex][columnIndex]
                        accumulator = accumulator + factor1 * factor2
                    }

                    // right, so I've looped over all the elements and accummulated the products into the accumulator
                    // all that remains is to pop the accumulator into the result at the correct place
                    productResult.matrix[rowIndex][columnIndex] = accumulator

                };
            };

            // so, it's all populated. Just need to return it
            return productResult

        } else {
            // dimensions are incompatible, no can do
            console.log("Trying to matrix multiply when dimensions are incompatible")
            return false
        }

    } else {
        // tried to use dotMultiply when one of the things was not a Matrix, no can do
        console.log("tried to use dotMultiply when one of the things was not a Matrix")
        return false
    };
};

Matrix.prototype.randomize = function() {
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            this.matrix[rowIndex][columnIndex] = Math.random();
        };
    };
};

Matrix.prototype.randomizeNormal = function() {
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            var normalRandom = Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()
            normalRandom = normalRandom / 6
            this.matrix[rowIndex][columnIndex] = normalRandom;
        };
    };
};

Matrix.prototype.randomizeMeanZero = function(seed) {
    // it's often preferable to initiate the weights with random values 
    // that have a mean of zero rather than 0.5
    // this does it
    this.randomizeNormal()
    this.multiply(2)
    this.add(-1)
};

Matrix.prototype.zeroFill = function() {
    // just fills with zeros 
    // useful for generating some predictable variable data for testing

    // now fill it up
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            this.matrix[rowIndex][columnIndex] = 0
        };
    };
};

Matrix.prototype.serialFill = function() {
    // just fills with serial integers 
    // useful for generating some predictable variable data for testing
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            this.matrix[rowIndex][columnIndex] = rowIndex * this.columns + columnIndex;
        };
    };
};

Matrix.prototype.mean = function() {

    // accumulate all the values
    var accumulator = 0

    // check the same in every row
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            var accumulator = accumulator + this.matrix[rowIndex][columnIndex]
        }
    }
    var mean = accumulator / (this.rows * this.columns)
        // and return it
    return mean
};

Matrix.prototype.meanAbs = function() {

    // accumulate all the values
    var accumulator = 0

    // check the same in every row
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            var accumulator = accumulator + Math.abs(this.matrix[rowIndex][columnIndex])
        }
    }
    var mean = accumulator / (this.rows * this.columns)
        // and return it
    return mean
};
Matrix.prototype.min = function() {

    // get the lowest value
    var lowestValue = this.matrix[0][0] // just set it temporarily to an actual value from the matrix. Safest way.
    var lowestValueRow
    var lowestValueColumn

    // check the same in every row
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            if (this.matrix[rowIndex][columnIndex] < lowestValue) {

                lowestValue = this.matrix[rowIndex][columnIndex]
                lowestValueRow = rowIndex
                lowestValueColumn = columnIndex
            }

        }
        lowestValue = Math.min(lowestValue, ...this.matrix[rowIndex])
    }

    // and return it
    return { "value": lowestValue, "row": lowestValueRow, "column": lowestValueColumn }
};

Matrix.prototype.max = function() {

    // get the highest value
    var highestValue = this.matrix[0][0] - 1 // just set it temporarily to an actual value from the matrix. Safest way.
    var highestValueRow
    var highestValueColumn

    // check the same in every row
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            if (this.matrix[rowIndex][columnIndex] > highestValue) {

                highestValue = this.matrix[rowIndex][columnIndex]
                highestValueRow = rowIndex
                highestValueColumn = columnIndex
            }

        }
    }

    // and return it
    return { "value": highestValue, "row": highestValueRow, "column": highestValueColumn }
};

Matrix.prototype.normalise = function() {
    // takes the highest value in the matrix and makes it 1 
    // takes the lowest value in the matrix and makes it zero
    // spreads the rest of the values proportionally between

    // First get the highest and lowest values
    var highestValue = this.max().value
    var lowestValue = this.min().value

    // now what is the difference
    var delta = highestValue - lowestValue

    // now loop all over the matrix and normalise
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            var thisValue = this.matrix[rowIndex][columnIndex]
            var normalisedValue = (thisValue - lowestValue) / delta
            this.matrix[rowIndex][columnIndex] = normalisedValue
        };
    };
};

Matrix.prototype.transpose = function() {
    // remember that the whole thing is horribly unoptimised :)

    // it will have as many rows as columns and vice versa
    // so let's create a new Matrix for the transposed result 
    var transposeResult = new Matrix(this.columns, this.rows)
    transposeResult.name = "transposeOf (" + this.name + ")"

    // now loop all over the matrix and swap
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            var thisValue = this.matrix[rowIndex][columnIndex]
            transposeResult.matrix[columnIndex][rowIndex] = thisValue
        };
    };
    return transposeResult
};

Matrix.prototype.copyStructure = function() {

    // it will be a zeros Matrix and have as many rows and columns as this
    // so let's create a new Matrix for the product 
    var copiedStructure = new Matrix(this.rows, this.columns)
    copiedStructure.name = "structuralCopyOf (" + this.name + ")"

    // and return it
    return copiedStructure
}

Matrix.prototype.copyWithValues = function() {

    // it will be a new identical Matrix 
    // so first let's create a new empty Matrix  
    var copiedWithValues = this.copyStructure()

    // then load in the values from the internal array
    var copyOfInternalArray = this.matrix.slice()
    copiedWithValues.setValuesFromArray(copyOfInternalArray)
    copiedWithValues.name = "deepCopyOf (" + this.name + ")"

    // and return it
    return copiedWithValues
}

Matrix.prototype.raiseElementsToPower = function(power) {

    // In place, raise each element to the power passed in 
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            var originalValue = this.matrix[rowIndex][columnIndex]
            var valueRaisedToThePower = Math.pow(originalValue, power)
            this.matrix[rowIndex][columnIndex] = valueRaisedToThePower;
        };
    };
}
Matrix.prototype.binarize = function(threshold, lowValue) {

    // If element is greater than or equal to the threshold set to 1 
    // else set to lowValue
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            var originalValue = this.matrix[rowIndex][columnIndex]

            if (originalValue >= threshold) {
                var newValue = 1
            } else {
                var newValue = lowValue
            }

            this.matrix[rowIndex][columnIndex] = newValue;
        };
    };
}

Matrix.prototype.containsNan = function() {

    // retrun true if any of the elements are Nan
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            var originalValue = this.matrix[rowIndex][columnIndex]
            if (isNaN(originalValue)) {
                return true
            }

        };
    };
    return false
}

Matrix.prototype.subtract = function(thingToSubtract) {

    // let's check to see if the thingToSubtract is a matrix itself
    if (thingToSubtract instanceof Matrix) {
        // I only allow add if dimensions are the same
        if (this.rows == thingToSubtract.rows && this.columns == thingToSubtract.columns) {
            for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
                for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
                    var valueToSubtract = thingToSubtract.matrix[rowIndex][columnIndex] * 1.0
                    var originalValue = this.matrix[rowIndex][columnIndex] * 1.0
                    this.matrix[rowIndex][columnIndex] = originalValue - valueToSubtract;
                };
            };
        } else {
            // dimensions are different, no can do
            console.log("Trying to matrix add when dimensions are different")
            return false
        }

    } else {
        // it's not a Matrix so let's do a scalar add
        for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
            for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
                var originalValue = this.matrix[rowIndex][columnIndex] * 1.0
                this.matrix[rowIndex][columnIndex] = originalValue - thingToSubtract * 1.0;
            };
        };
    }
};

function roughSizeOfObject(object) {

    var objectList = [];
    var stack = [object];
    var bytes = 0;

    while (stack.length) {
        var value = stack.pop();

        if (typeof value === 'boolean') {
            bytes += 4;
        } else if (typeof value === 'string') {
            bytes += value.length * 2;
        } else if (typeof value === 'number') {
            bytes += 8;
        } else if (
            typeof value === 'object' &&
            objectList.indexOf(value) === -1
        ) {
            objectList.push(value);

            for (var i in value) {
                stack.push(value[i]);
            }
        }
    }
    return bytes;
}