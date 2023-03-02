const sel = (selector, type = 1) => {
    if (type == 1) {
        return document.querySelector(selector);
    } else {
        return document.querySelectorAll(selector);
    }
}

const make = (elem, clan = 1, id = 1, cls = [], htm = 1) => {
    let el = document.createElement(elem);

    clan != 1 ? el.setAttribute("data-item-clan", clan) : null;
    id != 1 ? el.setAttribute("id", id) : null;
    htm != 1 ? el.innerHTML = htm : null;

    if ( clan == "enemy") {
        el.style.position = "absolute";
    }
    if (cls.length > 0) {
        for ( i in cls) {
            el.classList.add(cls[i]);
        }
    }

    return el;
}
const make_pawn = (clan) => {
    let pawn = make("div", clan);
    let pawn_pos = Math.round(Math.random() * 400);
    let host = Array.from(sel(".game_chunk", 2))[pawn_pos];
    if (Array.from(host.children).length == 0) {
        host.appendChild(pawn);
        host.setAttribute("data-influence-owner", `${pawn.getAttribute("data-item-clan")}_host`);
        host.setAttribute("data-influence-power", 10);
    } else {
        make_pawn(clan);
    }
    
}

const append = (host, child, corx, cory) => {
    child.style.top = cory;
    child.style.left = corx;
    let host_elem = sel(host, 1);
    host_elem.appendChild(child);
}

for (let i = 0; i < 400; i++) {
    let game_chunk = make("div", 1, 1, ["game_chunk"]);
    game_chunk.setAttribute("data-influence-owner", "null");
    game_chunk.setAttribute("data-influence-power", "0");
    game_chunk.setAttribute("data-influence-duration", "0");
    game_chunk.setAttribute("data-property-xcor", i%20 + 1);
    game_chunk.setAttribute("data-property-ycor", Math.floor(i/20) + 1);
    append(".game_board", game_chunk, 1, 1);
}


make_pawn("enemy");
make_pawn("enemy");
make_pawn("friendly");
make_pawn("friendly");

let turnCount = 0;
let nextTurn = sel('[data-action="action_turn"]');

sel(".turn_count", 1).innerHTML = turnCount;

nextTurn.addEventListener("click", () => {
    turnCount += 1;
    sel(".turn_count", 1).innerHTML = turnCount;

    setInterval(() => {
        growDaughter("friendly");
        growMother("friendly");

        growDaughter("enemy");
        growMother("enemy");
    }, 100)
})

function growDaughter(type) {
    sel(`[data-influence-owner= ${type}]`, 2).forEach(daughter => {
        growUnit(daughter);
    })
}

function growMother(type) {
    let allMother = sel(`[data-item-clan= ${type}]`, 2);

    allMother.forEach(item => {
        growUnit(item.parentElement);
    })
}

function growUnit(item) {
    let myXCor = parseInt(item.getAttribute("data-property-xcor"));
    let myYCor = parseInt(item.getAttribute("data-property-ycor"));
    let myNeighbourTiles= [];

    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if ( i == 0 || j == 0) {
                if (i == 0 && j == 0) {
                } else {
                    if (myXCor + i > 0 && myYCor + j > 0 && myXCor + i <= 20 && myYCor + j <= 20) {
                        let thisNeighbour = sel(`[data-property-xcor="${myXCor + i}"][data-property-ycor="${myYCor + j}"]`, 1);
                        myNeighbourTiles.push(thisNeighbour);
                    }
                }
            }
        } 
    }
    myNeighbourTiles.forEach(neighbour => {
        attackNeighbour(neighbour, item);
        expandInfluence(neighbour, item);
        empowerNeighbour(neighbour, item);
    });
}

function expandInfluence(neighbour, me) {
    let myPower = parseInt(me.getAttribute("data-influence-power"));
    if (myPower > 3) {
        if (neighbour.getAttribute("data-influence-owner") == "null") {
            neighbour.setAttribute("data-influence-owner", `${me.getAttribute("data-influence-owner").split("_")[0]}`)
            if (me.getAttribute("data-influence-owner") != "friendly_host" && me.getAttribute("data-influence-owner") != "enemy_host") {
                myPower -= 3;
                me.setAttribute("data-influence-power", myPower);
            }
        }
    }
}

function attackNeighbour(neighbour, me) {
    let myPower = parseInt(me.getAttribute("data-influence-power"));
    let neighbourPower = parseInt(neighbour.getAttribute("data-influence-power"));
    if (myPower > 5) {
        if (neighbour.getAttribute("data-influence-owner") != "null") {
            if (neighbour.getAttribute("data-influence-owner").split("_")[0] != me.getAttribute("data-influence-owner").split("_")[0]) {
                myPower -= 3;
                neighbourPower -= 3;
                me.setAttribute("data-influence-power", myPower);
                if (neighbourPower <= 0) {
                    neighbour.setAttribute("data-influence-owner", me.getAttribute("data-influence-owner"));
                    neighbour.setAttribute("data-influence-power", Math.abs(neighbourPower));
                } else {
                    neighbour.setAttribute("data-influence-power", neighbourPower);
                }
            }
        }
    }
}
    
function empowerNeighbour(neighbour, me) {
    if (neighbour.getAttribute("data-influence-owner") == me.getAttribute("data-influence-owner").split("_")[0]) {
        let neighbourPower = parseInt(neighbour.getAttribute("data-influence-power"));
        if (neighbourPower < 10) {
            neighbour.setAttribute("data-influence-power", neighbourPower + 1);
        }
    }
}