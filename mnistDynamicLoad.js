function mnistDynamicLoad(testOrTrain) {

    console.log("about to load the functions")

    // define what we're trying to load
    // sorry for the magic number, it's the number of files that the mnist data is split into
    var numberOfMnistFiles = 20

    // define the root ogf the function name that the 20 files individually define
    var rootFunctionname = "createMnistData_"

    // Define the root of the file name 
    var rootFileName = "mnistData_mnist_" + testOrTrain + "_"

    // Create some storage to hold the function and file names
    // Then loop round and add the functions / files to it 
    var functionsToBeLoaded = []
    for (var functionIndex = 0; functionIndex < numberOfMnistFiles; functionIndex++) {
        var thisFunctionName = rootFunctionname + functionIndex
        var thisFileName = rootFileName + functionIndex
        functionsToBeLoaded.push({ "thisFunctionName": thisFunctionName, "thisFileName": thisFileName })
    }

    // initiate a load for each of files 
    var functionPath = "mnistData\\"
    for (var functionIndex = 0; functionIndex < numberOfMnistFiles; functionIndex++) {

        // get the function name out and build the relative path
        var thisFileName = functionsToBeLoaded[functionIndex].thisFileName
        var url = functionPath + thisFileName + ".js"

        // get ready to append the script tags into the head of the document
        var head = document.getElementsByTagName('head')[0];
        var thisRequiredFunctionScript = document.createElement('script');
        thisRequiredFunctionScript.type = 'text/javascript';
        thisRequiredFunctionScript.src = url;

        // Fire the loading
        head.appendChild(thisRequiredFunctionScript);
    }

    // and do the 1st test to see if they are loaded 
    // It repeats itself until they are all done
    // seperated out like this as we don't need tokeep repeating the stuff above 
    // but we need to cede control and allow the opening threads to have a go
    // Control is ceded at the end of the next function with a set time out 
    // and it calls itself again
    // but first destroy the functions if they are already loaded from a previous selection
    destroyFunctions(functionsToBeLoaded)
    waitUntilFunctionsLoaded(functionsToBeLoaded)

}

function destroyFunctions(functionsToBeLoaded) {

    // if we've loaded the functions before, clear them down as we may have chosen a different size
    // now check if they are loaded
    for (var functionIndex = 0; functionIndex < functionsToBeLoaded.length; functionIndex++) {

        // get the function name out 
        var thisFunctionName = functionsToBeLoaded[functionIndex].thisFunctionName

        // eval appears to be considered the work of the devil but I can't really see another way to do it
        // so destroy the function if it's aready loaded 
        eval(thisFunctionName + '= "This is not a function"')

    }
}

function waitUntilFunctionsLoaded(functionsToBeLoaded) {

    // now check if they are loaded
    // assume they are not
    var allLoaded = false
    var counter = 0

    counter = counter + 1
    if (counter > 10000) {
        console.log("Timed Out")
        return
    }

    // assume they are 
    allLoaded = true

    // now check if they are loaded
    for (var functionIndex = 0; functionIndex < functionsToBeLoaded.length; functionIndex++) {

        // get the function name out 
        var thisFunctionName = functionsToBeLoaded[functionIndex].thisFunctionName

        // eval appears to be considered the work of the devil but I can't really see another way to do it
        var typeIs = eval("typeof " + thisFunctionName)
        if (typeIs != "function") {
            allLoaded = false
        } else {
            console.log("loaded ok:" + thisFunctionName)
        }
    }

    // Now we're out of the loop, let's see if they all loaded
    // and get out if they did 
    if (allLoaded == true) {
        console.log("all the functions have loaded")
        return
    } else {
        // if they didn't all load yet then wait for a while and then check again
        console.log("Functions not loaded yet")
        var waitForInMilliseconds = 100
        setTimeout(function() {
            waitUntilFunctionsLoaded(functionsToBeLoaded)
        }, waitForInMilliseconds);
    }

}