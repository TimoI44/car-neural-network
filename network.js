class NeuralNetwork {

    constructor(neuronCounts) {
        this.levels = [];

        //Adds the levels to the array
        //neuronCount is a 2D array
        for(let i = 0; i < neuronCounts.length -1; i++) {
            this.levels.push(new Level(
                neuronCounts[i], neuronCounts[i+1]
            ));
        }
    }

    //Use the network to calculate an output
    static feedForward(givenInputs, network) {
        //Calculates the first level
        let outputs = Level.feedForward(givenInputs, network.levels[0]);
        //Loops through all following levels and saves the output in outputs
        for(let i = 1; i<network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i]);
        }
        return outputs;
    }


    //Randomly mutates the network by a certain amount
    //amount=1: every value is random
    //amount=0: no change at all
    static mutate(network, amount) {
        //For each level in the network
        network.levels.forEach(level => {

            //Change the biases into a random direction by the amount
            for(let i = 0; i < level.biases.length; i++) {
                level.biases[i] = lerp(
                    level.biases[i], //Current value
                    Math.random() * 2 - 1, //Number between 1 and -1
                    amount //Amount it should change
                );
            }

            //Change the weights into a random direction by the amountt
            for(let i=0;i<level.weights.length;i++){
                for(let j=0;j<level.weights[i].length;j++){
                    level.weights[i][j]=lerp(
                        level.weights[i][j], //Current value
                        Math.random()*2-1, //Number between 1 and -1
                        amount //Amount it should change
                    )
                }
            }
        });
    }
}

class Level {
    
    constructor(inputCount, outputCount) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        this.weights = [];
        //Each input node is connected with all output nodes
        for(let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        Level.#randomize(this);
    }

    //Loops through all weights and biases in a level and sets them to a random value between 1 and -1
    static #randomize(level) {
        //weights
        for(let i = 0; i < level.inputs.length; i++) {
            for(let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 -1;
            }
        }

        //biases
        for(let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 -1;
        }
    }

    //calculates one level and returns the outputs
    static feedForward(givenInputs, level) {
        //set the level inputs to the given inputs
        for(let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        //calculates what outputs should be on and off (1 or 0)
        for(let i = 0; i < level.outputs.length; i++) {
            let sum = 0; // The sum of all input values times their weights

            //loops through all inputs and adds them to sum
            for(let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }

            if(sum > level.biases[i]) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }
        return level.outputs;
    }
}