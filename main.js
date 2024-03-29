//Setting up the canvas
const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 400;
const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

//Setting up cars and roads
const road = new Road(carCanvas.width/2, carCanvas.width * 0.9);

//EDITABLE VARIABLES
const N = 500; //The number of simulated cars each run
const trafficCarCount = 30; //Traffic cars that should be spawned
const mutationAmount = 0.03; //The amount the network gets mutated

const cars = generateCars(N);
let bestCar = cars[0];

//Setting the network of each car to the best network and mutating it
if(localStorage.getItem("bestBrain")) {
    for(let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));

        if(i != 0) { //One car will keep the former best network
            NeuralNetwork.mutate(cars[i].brain, mutationAmount);
        }
    }
}

const traffic = generateTraffic(trafficCarCount);

//Automates learning process
/*setTimeout(() => { 
    save();
    location.reload()
 }, 9000);*/


animate()

//saves the best brain
function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
    console.log("save");
}

//deletes the best brain
function discard() {
    localStorage.removeItem("bestBrain");
    console.log("discard");
}

//Generates n cars
function generateCars(N) {
    const cars = [];
    for(let i = 0; i < N; i++) {
        //x, y, width, height, acceleration, maxSpeed
        cars.push(new Car(road.getLaneCenter(1), 300, 26, 50, 0.2, 5, "AI"))
    }
    return cars;
}

function generateTraffic(N) {
    const traffic = [];
    for(let i = 0; i < N; i++) {
        traffic.push(new Car(road.getLaneCenter(randomIntFromInterval(0, 2)), //Random road
         -1 * (i*100), // Random Y
          26, 50, 0.2, 2, "DUMMY"))
    }
    return traffic;
}

//Running all update methods and animates the scene
function animate(time) {
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for(let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    //Finds the car that drove the longest
    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, "red");
    }

    carCtx.globalAlpha = "0.2";
    for(let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, "blue");
    }
    carCtx.globalAlpha = "1";
    bestCar.draw(carCtx, "blue", true)

    carCtx.restore();
    
    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain)
    requestAnimationFrame(animate);
}