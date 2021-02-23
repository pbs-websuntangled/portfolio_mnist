function reconstituteSavedNeuralNet(elementsOfNeuralNet) {

    var numberOfInputNodes = elementsOfNeuralNet.numberOfInputNodes
    var numberOfHiddenNodes = elementsOfNeuralNet.numberOfHiddenNodes
    var numberOfOutputNodes = elementsOfNeuralNet.numberOfOutputNodes

    // and now create the neural net to pass back
    var neuralNetToPassBack = new NeuralNet(numberOfInputNodes, numberOfHiddenNodes, numberOfOutputNodes)

    // now set the elements 
    neuralNetToPassBack.name = elementsOfNeuralNet.name
    neuralNetToPassBack.description = elementsOfNeuralNet.description
    neuralNetToPassBack.numberOfInputNodes = elementsOfNeuralNet.numberOfInputNodes;
    neuralNetToPassBack.numberOfOutputNodes = elementsOfNeuralNet.numberOfOutputNodes;
    neuralNetToPassBack.numberOfHiddenNodes = elementsOfNeuralNet.numberOfHiddenNodes;
    neuralNetToPassBack.alpha = elementsOfNeuralNet.alpha
    neuralNetToPassBack.weights_ih.setValuesFromArray(elementsOfNeuralNet.arrayOfWeights_ih)
    neuralNetToPassBack.weights_ho.setValuesFromArray(elementsOfNeuralNet.arrayOfWeights_ho)

    // and give it back
    return neuralNetToPassBack
}