class Car {

    constructor(x, y, width, height, acceleration, maxSpeed, controlType) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = acceleration;
        this.maxSpeed = maxSpeed;
        //Friction has to be lower than acceleration
        this.friction = 0.1;

        this.angle = 0;
        this.turningSpeed = 0.03;
        this.damaged = false;

        this.useBrain = controlType == "AI";

        if(controlType != "DUMMY") {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
        }

        this.controls = new Controls(controlType);
    }

    update(roadBorders, traffic) {
        //handles basic movement
        if(!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }

        //updates the sensor and passes data to the brain
        if(this.sensor) {

            this.sensor.update(roadBorders, traffic);
            //readings of the sensor
            const offset = this.sensor.readings.map(s => s == null ? 0 : 1-s.offset);
            //network output
            const outputs = NeuralNetwork.feedForward(offset, this.brain);

            //connecting brain to controls
            if(this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }

    }

    //Draws the car to the canvas at the current x and y position
    //Draws the sensor rays
    draw(ctx, color, drawSensor = false) {
        if(this.damaged) {
            ctx.fillStyle = "gray";
        } else {
            ctx.fillStyle = color;
        }

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y)
        for(let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        //Draw the sensor rays
        if(this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }
    }


    //---Private Functions---
    
    //Handles the driving & physics
    #move() {

        //Friction will always be applied
        if(this.speed > 0) {
            this.speed -= this.friction;
        } else if(this.speed < 0) {
            this.speed += this.friction;
        }
        if(Math.abs(this.speed)<this.friction) {
            this.speed = 0;
        }

        //Accelerating & breaking
        if(this.controls.forward && this.speed <= this.maxSpeed) {
            this.speed += this.acceleration;
        }
        if(this.controls.reverse && this.speed>= -this.maxSpeed/2) {
            this.speed -= this.acceleration;
        }

        //Turning
        if(this.speed!=0) {
            const flip = this.speed > 0 ? 1 : -1;
            if(this.controls.left) {
                this.angle += this.turningSpeed * flip;
            }
            if(this.controls.right) {
                this.angle -= this.turningSpeed * flip;
            }

            //Applying the speed
            this.x -= Math.sin(this.angle) * this.speed;
            this.y -= Math.cos(this.angle) * this.speed;
        }
    }

    //Returns an array of all edge points of the car
    //Can be edited to change the cars shape
    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height)/2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });
        return points;
    }

    //Handles the damage
    #assessDamage(borders, traffic) {
        //loops through borders and checks if polys intersect
        for(let i = 0; i<borders.length; i++) {
            if(polysIntersect(this.polygon, borders[i])) {
                return true;
            }
        }
        //loops through traffic and checks if polys intersect
        for(let i = 0; i<traffic.length; i++) {
            if(polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }
}