// This is a handrolled neuralNet library by PBS 
// I wouldn't really expect anyone to use it except for demo or learning purposes
// I find that I only really have a chance of understanding something when I take this approach.

function NeuralNet(numberOfInputNodes, numberOfHiddenNodes, numberOfOutputNodes) {

    // This builds the neural net that can then be trained 
    // The layers are transient and have no value except for holding the values as they flow through the net
    // The numbers of columns in the layers are dependant on how many examples are pushed through in each batch
    // it means we need to know how many examples there are before we do the initiation
    // The numbers of rows and columns in the weight matrices are dependent on the number of nodes in the 3 layers
    // The weights are the things of value and must be saved after training

    // get the setup parameters    
    this.numberOfInputNodes = numberOfInputNodes;
    this.numberOfOutputNodes = numberOfOutputNodes;
    this.numberOfHiddenNodes = numberOfHiddenNodes;

    // set a default name
    this.name = this.constructor.name

    // set the default activation function
    this.activationType_ih = "leakyRelu"
    this.activationType_ho = "leakyRelu"
    this.activationType_ih = "relu"
    this.activationType_ho = "relu"
    this.activationType_ih = "tanH"
    this.activationType_ho = "tanH"
    this.activationType_ih = "sigmoid"
    this.activationType_ho = "sigmoid"

    // add the tried and correct score keeper for once it's trained
    this.tried = 0;
    this.close = 0;
    this.correct = 0;

    // put in an initial alpha 
    this.alpha = 0.001 // probably will be overwritten later

    // outputLayerError is part of the template
    this.outputLayerError = new Matrix(1, numberOfOutputNodes)
    this.outputLayerError.zeroFill();
    this.outputLayerError.name = "outputLayerError"
    this.outputLayerError.add(1)

    // Create the weights
    // Hmmm - How big is the weights matrix?
    // well, for each node in the hidden layer, we need a weight for each of the nodes in the input layer 
    // to get the matrix multiplication to work correctly, weights is the 1st operand and the input is 2nd
    // it will create a new weights matrix that has 1 row for each node in the hidden layer 
    // and 1 column for each node in the input 

    // create the initial weights matrix for input to hidden and initialise it to random values
    var numberOfNodesInThisLayer = this.numberOfInputNodes
    var numberOfNodesInNextLayer = this.numberOfHiddenNodes
    this.weights_ih = createInitialWeights(numberOfNodesInThisLayer, numberOfNodesInNextLayer)
    this.weights_ih.name = "weights_ih"

    // create the initial weights matrix for hidden to output and initialise it to random values
    var numberOfNodesInThisLayer = this.numberOfHiddenNodes
    var numberOfNodesInNextLayer = this.numberOfOutputNodes
    this.weights_ho = createInitialWeights(numberOfNodesInThisLayer, numberOfNodesInNextLayer)
    this.weights_ho.name = "weights_ho"

};

function createInitialWeights(numberOfNodesInThisLayer, numberOfNodesInNextLayer) {

    // Hmmm. Can't really see why this is part of NeuralNet. It could be completely stand alone 
    // Maybe it's better just so I can keep them together???
    // Todo: get sure why it's like it or change it

    // create a new instance of a matrix and initialise all the cells to a random number
    var weights = new Matrix(numberOfNodesInNextLayer, numberOfNodesInThisLayer)
    weights.randomizeMeanZero()

    // and return it
    return weights
}

NeuralNet.prototype.setAlpha = function(alpha) {

    this.alpha = alpha

    // just tell console
    console.log("Alpha just been set to:" + alpha)
}

NeuralNet.prototype.forwardPropagateAllLayers = function(inputLayer) {

    // create the input layer as a part of this model
    this.inputLayer = inputLayer

    // then create the hidden layer by dotMultiplying the weights, take a copy and activate it
    // for back propagation we need activated and non activated
    this.hiddenLayer = this.weights_ih.dotMultiply(this.inputLayer)
    this.hiddenLayerActivated = this.hiddenLayer.copyWithValues()

    this.hiddenLayerActivated.activate(this.activationType_ih)

    // take the hidden layer and create the output layer
    this.outputLayer = this.weights_ho.dotMultiply(this.hiddenLayerActivated)
    this.outputLayerActivated = this.outputLayer.copyWithValues()
    this.outputLayerActivated.activate(this.activationType_ho)

    var debugForwardPropagation = false
    if (debugForwardPropagation) {

        // let's have a look at everything 
        console.log("In debug: InputNodes.matrix")
        console.table(inputLayer.matrix)

        console.log("In debug: this.weights_ih.matrix")
        console.table(this.weights_ih.matrix)

        console.log("In debug: hiddenLayer.matrix")
        console.table(this.hiddenLayer.matrix)

        console.log("In debug: hiddenLayerActivated.matrix")
        console.table(this.hiddenLayerActivated.matrix)

        console.log("In debug: this.weights_ho.matrix")
        console.table(this.weights_ho.matrix)

        console.log("In debug: outputLayer.matrix")
        console.table(this.outputLayer.matrix)

        console.log("In debug: outputLayerActivated.matrix")
        console.table(this.outputLayerActivated.matrix)
    }

    // say it was fine
    return true

}

NeuralNet.prototype.trainNeuralNet = function(inputLayer, truth, numberOfEpochs) {

    // log that we changed the alpha 
    console.log("About to start training the neural net")

    var reportEveryEpochs = Math.min(numberOfEpochs / 50, 10000)

    // Now do the big loop of forward and backward propagation for all the epochs
    // get a measure of the mean absolute error so we can compare epoch to epoch and decrease alpha if it bounces back up
    // space for a copy of the weights that will survive 
    var copyOfWeightsWithMeanError = { "lastEpochMeanAbsoluteError": this.outputLayerError.meanAbs() }

    // now the loop
    for (var epochIndex = 0; epochIndex < numberOfEpochs; epochIndex++) {

        // do the forward propagation
        this.forwardPropagateAllLayers(inputLayer)

        // do the backwards propagation
        this.backPropagateAllLayers(truth)

        // if the number of epochs done is a multiple of 10 then display the result
        var epochsCompleted = epochIndex + 1
        if ((Math.floor(Math.abs(epochsCompleted % reportEveryEpochs)) == 0) ||
            (epochIndex == numberOfEpochs - 1) ||
            (epochIndex == 0)) {

            // get the mean absolute error 
            var thisEpochMeanAbsoluteError = this.outputLayerError.meanAbs()

            // put the progress to the web page and the console
            progress = "<p>Mean of Absolute Errors after: " + epochsCompleted + " epochs is: " + thisEpochMeanAbsoluteError + "</p>"
            webDisplayBackPropagationProgress.insertAdjacentHTML("afterBegin", progress)
            console.log("progress: " + epochsCompleted + " of: " + numberOfEpochs + " and meanAbsoluteError was:" + copyOfWeightsWithMeanError.lastEpochMeanAbsoluteError + " is: " + thisEpochMeanAbsoluteError)

            // did we overshoot (ie the mean absolute error increased)?
            // Think this might be called a momentum function
            var improvementInAccuracy = copyOfWeightsWithMeanError.lastEpochMeanAbsoluteError - thisEpochMeanAbsoluteError
            if (improvementInAccuracy < 0) {
                // the weights are getting worse so...

                // replace the current weights with the previous ones that were better
                // this.weights_ih = copyOfWeightsWithMeanError.weights_ih.copyWithValues()
                //this.weights_ho = copyOfWeightsWithMeanError.weights_ho.copyWithValues()

                // drop the alpha by half
                var oldAlpha = this.alpha
                this.alpha = this.alpha * 0.8
                this.alpha = this.alpha.toPrecision(3) * 1.0

                // log that we changed the alpha 
                console.log("MeanAbsError moved from: " + copyOfWeightsWithMeanError.lastEpochMeanAbsoluteError + " to: " + thisEpochMeanAbsoluteError + " Alpha changed from: " + oldAlpha + " to: " + this.alpha)
            } else {
                // the weights are getting better
                // so take a copy of them in case they get worse
                copyOfWeightsWithMeanError.weights_ih = this.weights_ih.copyWithValues()
                copyOfWeightsWithMeanError.weights_ho = this.weights_ho.copyWithValues()

                // now update the last epoch mean absolute error 
                copyOfWeightsWithMeanError.lastEpochMeanAbsoluteError = thisEpochMeanAbsoluteError
                debugBackwardPropagation = false
            }

            // do the console logging next time through
            debugBackwardPropagation = false

        }
    }
}

NeuralNet.prototype.backPropagateAllLayers = function(truth) {

    // Back propagation broke me :( 
    // I hoped to do the whole thing without looking at anyones code, just by reading articles. 
    // I was ok up to this point but my maths is just too flaky :( 
    // So I looked at code by Tariq Rashid (wrote the book I'm reading about it)
    // this link is video I'm learning from on https://youtu.be/b7oYqAlX_Bo?t=38m2s
    // anyway!

    // having a bit of trouble with Nans 
    debugBackwardPropagation = true
    if (debugBackwardPropagation) {
        if (this.outputLayerActivated.containsNan()) {
            var youCanBreakHere = true
        }
    }
    debugBackwardPropagation = false

    // store the truth in here
    this.truth = truth

    // get the error at the output layer
    // I'll definitely need the truth and the outputs again so take a copy 
    // truth - calculated then apply the activation derivative function to the result
    this.outputLayerError = truth.copyWithValues()
    this.outputLayerError.subtract(this.outputLayerActivated)

    // above here seems functionally equivalent to Tariq Rashid

    // Update the ho weights 
    // get the elements for a big calculation then add the weight incrementor to the weights
    // to pull it in lime with "I Am Trask" doing bit of renaming
    var outputLevelDelta = this.outputLayerActivated.copyWithValues()

    outputLevelDelta.activationDerivative(this.activationType_ho)
    outputLevelDelta.multiply(this.outputLayerError) // must be elementwise

    // above here seems functionally equivalent to I Am Trask

    var hiddenLayerActivatedT = this.hiddenLayerActivated.transpose()
    var hoWeightIncrementor = outputLevelDelta.dotMultiply(hiddenLayerActivatedT)
    hoWeightIncrementor.multiply(this.alpha)
    this.weights_ho.add(hoWeightIncrementor) // bloody hell, could that be it?

    // now update the ih weights 
    // first get the hidden error by getting a transpose of the output weights (to spread the error correctly) 
    // multiplying it by the this.outputLayerError (not the activationDerivative version)
    var inputLayerT = this.inputLayer.transpose()

    var factor2 = this.hiddenLayerActivated.copyWithValues()

    // get the error at the hidden layer 
    var weights_hoT = this.weights_ho.transpose()
    var hiddenLayerError = weights_hoT.dotMultiply(this.outputLayerError) // this is correct 

    factor2.activationDerivative(this.activationType_ih)
    factor2.multiply(hiddenLayerError)
    var ihWeightIncrementor = factor2.dotMultiply(inputLayerT)
    ihWeightIncrementor.multiply(this.alpha)
    this.weights_ih.add(ihWeightIncrementor) // bloody hell, could that be it (again!)?    

    if (debugBackwardPropagation) {

        // let's have a look at everything 
        console.log("In debug: InputNodes.matrix")
        console.table(this.inputLayer.matrix)

        console.log("In debug:this.weights_ih.matrix")
        console.table(this.weights_ih.matrix)

        console.log("In debug: hiddenLayer.matrix")
        console.table(this.hiddenLayer.matrix)

        console.log("In debug: this.weights_ho.matrix")
        console.table(this.weights_ho.matrix)

        console.log("In debug: outputLayerActivated.matrix")
        console.table(this.outputLayerActivated.matrix)

        console.log("In debug: truth.matrix")
        console.table(truth.matrix)

        console.log("In debug: outputLayerError.matrix")
        console.table(this.outputLayerError.matrix)

        // put a point that I can break at
        var youCanBreakHere = true

    }

    // and get out
    return true

}

Matrix.prototype.activate = function(activationType) {

    // does in place activation using the sigmoid function
    // use the activation function
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            var originalValue = this.matrix[rowIndex][columnIndex]
            var activatedValue
                // now check the type and do the appropriate activation
            if (activationType == "sigmoid") {
                activatedValue = 1 / (1 + Math.exp(-originalValue))

            } else if (activationType == "relu") {
                activatedValue = Math.max(0, originalValue)

            } else if (activationType == "leakyRelu") {
                if (originalValue < 0) {
                    activatedValue = 0.01 * originalValue
                } else {
                    activatedValue = originalValue
                }
            } else if (activationType == "tanH") {
                activatedValue = Math.tanh(originalValue)
            }

            this.matrix[rowIndex][columnIndex] = activatedValue;
        };
    };
}

Matrix.prototype.activationDerivative = function(activationType) {

    // create the in place derivative of the activation function
    // put together for back propoagation of a neural net 
    // not sure if it has wider use but hey!!!
    for (var rowIndex = 0; rowIndex < this.rows; rowIndex++) {
        for (var columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            var originalValue = this.matrix[rowIndex][columnIndex]
            var activationDerivativeValue
                // now check the type and do the appropriate activation
            if (activationType == "sigmoid") {
                activationDerivativeValue = originalValue * (1 - originalValue)

            } else if (activationType == "relu") {
                if (originalValue < 0) {
                    activationDerivativeValue = 0
                } else {
                    activationDerivativeValue = 1
                }
            } else if (activationType == "leakyRelu") {
                if (originalValue < 0) {
                    activationDerivativeValue = 0.01
                } else {
                    activationDerivativeValue = 1
                }
            } else if (activationType == "tanH") {
                activationDerivativeValue = 1 - (originalValue * originalValue)
            }

            this.matrix[rowIndex][columnIndex] = activationDerivativeValue;
        };
    };
}