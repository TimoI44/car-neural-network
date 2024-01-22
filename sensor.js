class Sensor {

    constructor(car) {
        this.car = car;
        this.rayCount = 5;
        this.rayLenght = 160;
        this.raySpread = Math.PI/3;
        
        this.readings = [];
        this.rays = [];
    }

    update(roadBorders, traffic) {
       this.#castRays();
       
        //The rays array and the readings array have matching indexes    
        //E.g: The reading for the ray in rays[1] is in readings[1] and so on
        this.readings = []; //Every reading is an object with a x, y and offset value
        
        //Loops through the rays and gets the readings for each one
        for(let i = 0; i < this.rays.length; i++) {
            this.readings.push(
                this.#getReading(this.rays[i], roadBorders, traffic)
            );
        }
    }

    //Draws the rays
    draw(ctx) {
        //Loop through all the rays
        for(let i = 0; i < this.rayCount; i++) {

            let end = this.rays[i][1]; //default end of the ray is an object with x and y values
            //if the reading of the index of the current ray is not null
            if(this.readings[i]) {
                end = this.readings[i]; //End is still an object with an x and y value
            }

            //Shows the rays with their readings
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";

            ctx.moveTo(
                //these two values are basically just the car position
                this.rays[i][0].x,
                this.rays[i][0].y,
            );
            ctx.lineTo(
                end.x,
                end.y,
            );
            ctx.stroke();

            //Shows their full potential lenght
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";

            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y,
            );
            ctx.lineTo(
                end.x,
                end.y,
            );
            ctx.stroke();
        }
    }

    //Draws all the rays
    #castRays() {
        this.rays = [];

        //Loops through the number of rays we want
        for(let i = 0; i < this.rayCount; i++) {
            //calculates the angle for the ray
            const rayAngle = lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount == 1 ? 0.5 : i/(this.rayCount-1),
            ) + this.car.angle;

            // the rays should start from the position of the car
            const start = {x: this.car.x, y: this.car.y};
            // calculates the end point for the ray
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLenght,
                y: this.car.y - Math.cos(rayAngle) * this.rayLenght,
            };
            //pushes the two positions to the rays array
            this.rays.push([start, end]);
        }
    }

    //Gets the reading for a ray
    //Returns the x, y and offset value of the closest collision
    #getReading(ray, borders) {
        let touches = []; // Array of touches

        //loops through the borders
        for(let i = 0; i < borders.length; i++) {
            //gets the instersection between the ray and the borders
            //it returns an x, y and offset value
            const touch = getIntersection(
                ray[0], ray[1],
                borders[i][0], borders[i][1]
            );
            // only pushes touch if it has a value
            if(touch) {
                touches.push(touch);
            }
        }

        //loops through the cars
        for(let i = 0; i < traffic.length; i++) {
            //gets the polygon of each car
            const poly = traffic[i].polygon;
            //loops through every point
            for(let j = 0; j < poly.length; j++) {
                //gets the intersection
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1)%poly.length]
                );
                if(value){
                    touches.push(value);
                }
            }
        }

        //Return null if touches is empty
        if(touches.length == 0) {
            return null;
        } else {
            const offsets = touches.map(e=>e.offset); //get all offsets
            const minOffset = Math.min(...offsets); //calculate the smallest
            return touches.find(e => e.offset == minOffset); //return the touch with the smallest offset
        }
    }
}