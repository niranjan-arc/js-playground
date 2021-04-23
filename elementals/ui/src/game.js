canvas = document.getElementsByTagName('canvas')[0]
pass = document.getElementById('pass')
message = document.getElementById('message')
score = document.getElementById('score')
canvas.width = 760
canvas.height = 600
context = canvas.getContext('2d')


const fire = new Image()
fire.onload = (e) => { Game.gfx.fire = e.target }
fire.src = '/static/img/fire.png'

const water = new Image()
water.onload = (e) => { Game.gfx.water = e.target }
water.src = '/static/img/water.png'

const earth = new Image()
earth.onload = (e) => { Game.gfx.earth = e.target }
earth.src = '/static/img/earth.png'

const air = new Image()
air.onload = (e) => { Game.gfx.air = e.target }
air.src = '/static/img/air.png'

const evoid = new Image()
evoid.onload = (e) => { Game.gfx.void = e.target }
evoid.src = '/static/img/void.png'

const Game = {
    gfx: {
        fire: 'red',
        water: 'blue',
        void: 'gray',
        air: 'lightblue',
        earth: 'brown'
    },
    tileSize: 40,
    primaryTeamOffsetX: 0,
    primaryTeamOffsetY: 320,
    secondaryTeamOffsetX: 0,
    secondaryTeamOffsetY: 0,
    id: null
}


function drawBlock(ctx, offsetX, offsetY, block, isPrimaryTeam) {
    const row = isPrimaryTeam ? block.row : (7 - block.row - 1)
    var x = offsetX + block.column * Game.tileSize
    var y = offsetY + row * Game.tileSize
    if(block.id == 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.fillRect(x, y, Game.tileSize, Game.tileSize)
    }
}


function drawElemental(ctx, offsetX, offsetY, elemental, isPrimaryTeam) {
    const row = isPrimaryTeam ? elemental.row : (7 - elemental.row - 1)
    var x = offsetX + elemental.column * Game.tileSize
    var y = offsetY + row * Game.tileSize
    if(elemental.selected) {
        ctx.fillStyle = isPrimaryTeam ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 0, 0, 0.5)"
        ctx.fillRect(x, y, Game.tileSize, Game.tileSize)
    }
    if(Game.gfx[elemental.race] instanceof Image) {
        ctx.drawImage(Game.gfx[elemental.race], x, y)
    }
    else {
        x += Game.tileSize / 2
        y += Game.tileSize / 2
        ctx.fillStyle = Game.gfx[elemental.race]
        ctx.beginPath()
        ctx.ellipse(x, y, 10, 10, 0, 0, 2 * Math.PI)
        ctx.fill()
    }
    drawStats(ctx, offsetX, offsetY, elemental, isPrimaryTeam)
}


function drawBoard(ctx, board, teamId) {
    const isPrimaryTeam = teamId === Game.id
    const offsetX = isPrimaryTeam ? Game.primaryTeamOffsetX : Game.secondaryTeamOffsetX
    const offsetY = isPrimaryTeam ? Game.primaryTeamOffsetY : Game.secondaryTeamOffsetY
    const hzLineLength = board.columns * Game.tileSize
    for(let i = 0; i <= board.rows; i++) {
        let posY = offsetY + i * Game.tileSize
        ctx.beginPath()
        ctx.moveTo(offsetX, posY)
        ctx.lineTo(offsetX + hzLineLength, posY)
        ctx.stroke();
    }
    const vtLineLength = board.rows * Game.tileSize
    for(let i = 0; i <= board.columns; i++) {
        let posX = offsetX + i * Game.tileSize
        ctx.beginPath()
        ctx.moveTo(posX, offsetY)
        ctx.lineTo(posX, offsetY + vtLineLength)
        ctx.stroke();
    }
    for(let i = 0; i < board.highlighted.length; i++) {
        let row = isPrimaryTeam ? board.highlighted[i][0] : (7 - board.highlighted[i][0] - 1)
        let x = offsetX + board.highlighted[i][1] * Game.tileSize
        let y = offsetY + row * Game.tileSize

        // color gradient
        let rx = x + Game.tileSize / 2
        let ry = y + Game.tileSize / 2
        let color = isPrimaryTeam ? "0, 255, 0" : "255, 0, 0"
        var gradient = ctx.createRadialGradient(rx, ry, 5, rx, ry, 40);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)");
        gradient.addColorStop(1, "rgba(" + color + ", 0.8)");
        ctx.fillStyle = gradient
        ctx.fillRect(x, y, Game.tileSize, Game.tileSize)
    }
    for(let i = 0; i < board.tiles.length; i++) {
        let tile = board.tiles[i]
        switch(tile.type) {
            case 'elemental':
                drawElemental(ctx, offsetX, offsetY, tile, isPrimaryTeam)
                break;
            case 'static':
                drawBlock(ctx, offsetX, offsetY, tile, isPrimaryTeam)
                break;
        }
    }
}


const boundX = 20
const boundY = 20
const boundLength = Game.tileSize * 19
const boundHeight = Game.tileSize * 7


canvas.addEventListener('click', function(event) {
    // if(event.offsetY > (Game.board.startY + Game.board.vtLineLength / 2) && event.offsetY < (Game.board.startY + Game.board.vtLineLength / 2 + 10)) {
    //     return
    // }
    let c = Math.ceil((event.offsetX - Game.primaryTeamOffsetX) / Game.tileSize) - 1
    let r = Math.ceil((event.offsetY - Game.primaryTeamOffsetY) / Game.tileSize) - 1
    // clicked on enemy
    if(r < 0) {
        if(r === -1) {
            return
        }
        else {
            r += 1
        }
    }
    // validate r and c, we do not want to send unnecessary events
    websocket.send(JSON.stringify({
        type: 'click',
        at: [r, c],
        team: Game.id
    }));
});

pass.addEventListener('click', function(event) {
    websocket.send(JSON.stringify({
        type: 'pass',
        team: Game.id
    }));
})

function drawStats(ctx, offsetX, offsetY, elemental, isPrimaryTeam) {
    const row = isPrimaryTeam ? elemental.row : (7 - elemental.row - 1)
    const column = elemental.column
    ctx.fillStyle = '#f00'
    const x = offsetX + column * Game.tileSize
    const y = offsetY + row * Game.tileSize
    ctx.fillRect(x + 2, y + 3, 30, 5)
    ctx.fillStyle = '#0f0'
    ctx.fillRect(x + 2, y + 3, elemental.hp * 30, 5)
    ctx.fillStyle = '#000'
    ctx.textBaseline = 'top'
    ctx.fillText('' + elemental.rank, x + 33, y + 1)
}

function update(data) {
    // console.log('Calling update...')
    context.clearRect(0, 0, canvas.width, canvas.height)
    drawBoard(context, data[0].board, data[0].team)
    drawBoard(context, data[1].board, data[1].team)
    score.innerText = 'Score: ' + (data[0].team === Game.id ? (data[0].score + '/' + data[1].score) : (data[1].score + '/' + data[0].score))
}

function boardMessage(data) {
    message.innerText = data.message
}

function boardPass(data) {
    message.innerText = data.turn ? (data.turn === Game.id ? 'Your Turn...' : 'Waiting for opponent...') : ''
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

var websocket;

function handleMessage(event) {
    data = JSON.parse(event.data);
    switch (data.type) {
        case 'state':
            boardPass(data)
            update(data.teams)
            break;
        case 'connect':
            boardMessage(data)
            break;
        case 'pass':
            boardPass(data)
            break;
        default:
            console.error("unsupported event", data);
    }
}

function connect(name, choice) {
    const session = uuidv4()
    Game.id = session
    if(!websocket) {
        // websocket = new WebSocket("wss://670d3099f839.ngrok.io/")
        websocket = new WebSocket("ws://127.0.0.1:6789/")
        websocket.onmessage = handleMessage
        websocket.onopen = function(event) {
            console.log('Connection opened!')
            websocket.send(JSON.stringify({
                type: 'connect',
                id: session,
                name: name,
                choice: choice
            }))
        }
    }

}

(function() {
    let name, choice;
    const params = (window.location.search || '').replace('?', '').split('&')
    for(let i = 0; i < params.length; i++) {
        let splits = params[i].split('=')
        if(splits[0] === 'name') {
            name = splits[1]
        }
        else if(splits[0] === 'choice') {
            choice = splits[1].split(',')
        }
    }
    connect(name, choice)
})();
