class Road {

    constructor(x, width, laneCount = 3) {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        this.left = x-width/2;
        this.right = x+width/2;

        const infinity = 100000;
        this.top = -infinity;
        this.bottom = infinity;

        //Borders
        const topLeft = {x:this.left, y: this.top};
        const topRight = {x:this.right, y: this.top};
        const bottomLeft = {x:this.left, y: this.bottom};
        const bottomRight = {x:this.right, y: this.bottom};
        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight],
        ]

    }

    //Returns the x value of the center of the given road
    getLaneCenter(laneIndex) {
        const laneWidth = this.width/this.laneCount; //Width of one lane
        return this.left + laneWidth * Math.min(laneIndex, this.laneCount-1) + laneWidth/2;
    }

    //Draws the road
    draw(ctx) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        //Draws the dashed lines
        for(let i = 1; i<=this.laneCount-1; i++) {
            const x = lerp(this.left, this.right, i/this.laneCount);

            ctx.setLineDash([30, 20]);

            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }

        ctx.setLineDash([]);
        this.borders.forEach(border => {
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        });
    }
}