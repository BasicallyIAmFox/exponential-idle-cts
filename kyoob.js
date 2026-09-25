var id = "kyoob";
var name = "Kyoob";
var description = "Kyoob";
var authors = "BasicallyIAmFox";
var version = 1;

let north = ui.createBox({
    color: Color.fromRgba(1, 0, 0, 1),
    widthRequest: 50,
    heightRequest: 50,
});
north.translateTo(-north.widthRequest / 2, 0, 1);
north.rotateXTo(0, 1);
north.rotateYTo(0, 1);

let east = ui.createBox({
    color: Color.fromRgba(0, 1, 0, 1),
    widthRequest: 50,
    heightRequest: 50,
});

let west = ui.createBox({
    color: Color.fromRgba(1, 1, 0, 1),
    widthRequest: 50,
    heightRequest: 50,
});

let south = ui.createBox({
    color: Color.fromRgba(0, 0, 1, 1),
    widthRequest: 50,
    heightRequest: 50,
});

let up = ui.createBox({
    color: Color.fromRgba(1, 0, 1, 1),
    widthRequest: 50,
    heightRequest: 50,
});

let down = ui.createBox({
    color: Color.fromRgba(0, 1, 1, 1),
    widthRequest: 50,
    heightRequest: 50,
});

const horizontalFaces = [north, east, west, south];

let rotateX = 0, rotateY = 0;
var tick = (dt, _) => {
    dt *= 0.99;
    rotateX += dt; rotateY += dt;
    if (rotateY >= 4) rotateY = 0;
    
    /*let verticalTheta = rotateY % 1;
    if (rotateY >= 0 && rotateY < 1) {
        up.scaleYTo(verticalTheta, 100);
        up.translateTo(0, -(1 - verticalTheta) * up.heightRequest / 2, 100);
        down.scaleYTo(0, 1);
    } else if (rotateY >= 1 && rotateY < 2) {
        up.scaleYTo(1 - verticalTheta, 100);
        up.translateTo(0, verticalTheta * up.heightRequest / 2, 100);
    } else if (rotateY >= 2 && rotateY < 3) {
        down.scaleYTo(verticalTheta, 100);
        down.translateTo(0, -(1 - verticalTheta) * down.heightRequest / 2, 100);
        up.scaleYTo(0, 1);
    } else if (rotateY >= 3 && rotateY < 4) {
        down.scaleYTo(1 - verticalTheta, 100);
        down.translateTo(0, verticalTheta * down.heightRequest / 2, 100);
    }

    const horizontalFaceCurrent = horizontalFaces[Math.floor(rotateX)];
    const horizontalFaceNext = horizontalFaces[Math.floor(rotateX + 1) % horizontalFaces.length];
    const horizontalFaceOpposite = horizontalFaces[Math.floor(rotateX + 2) % horizontalFaces.length];
    const horizontalFacePrevious = horizontalFaces[Math.floor(rotateX + 3) % horizontalFaces.length];
    let horizontalTheta = rotateX % 1;
    horizontalFaceCurrent.scaleXTo((1 - horizontalTheta), 100);
    horizontalFaceCurrent.translateTo(-horizontalTheta * horizontalFaceCurrent.widthRequest / 2, 0, 100);
    horizontalFaceNext.scaleXTo(horizontalTheta, 100);
    horizontalFaceNext.translateTo((1 - horizontalTheta) * horizontalFaceNext.widthRequest / 2, 0, 100);
    horizontalFaceOpposite.scaleXTo(0, 1);
    horizontalFaceOpposite.translateTo(horizontalTheta * horizontalFaceOpposite.widthRequest / 2, 0, 100);
    horizontalFacePrevious.scaleXTo(0, 1);
    horizontalFacePrevious.translateTo((horizontalTheta + 1) * horizontalFacePrevious.widthRequest / 2, 0, 100);*/
};

const scrollView = ui.createScrollView({
    orientation: ScrollOrientation.BOTH,
    content: ui.createGrid({
        children: [
            north,
            //east,
            //west,
            //south,
            //up,
            //down,
        ],
    }),
});
scrollView.onScroll = () => {
    log(`${scrollView.scrollX} ${scrollView.scrollY}`);
};
var getEquationOverlay = () => {
    return scrollView;
};
