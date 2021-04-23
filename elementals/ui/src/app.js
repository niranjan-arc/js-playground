canvas = document.getElementsByTagName('canvas')[0]
canvas.width = 800
canvas.height = 600
context = canvas.getContext('2d')

const ELEMENTALS = {
    FIRE: '#bf2915',
    WATER: '#0000ff',
    VOID: '#3b3c66',
    AIR: '#d9ffff',
    EARTH: '#5e3030'
}

const LEVELS = {
    LEVEL_1: 1,
    LEVEL_2: 2,
    LEVEL_3: 3
}

const TEAMS = {
    TEAM_1: 1,
    TEAM_2: 2
}

const Game = {
    board: {
        rows: 14,
        columns: 19,
        tileSize: 40,
        startX: 20,
        startY: 20,
        get vtLineLength() {
            return this.rows * this.tileSize
        },
        get hzLineLength() {
            return this.columns * this.tileSize
        }
    },
    teams: {
        team1: {
            name: 'Team 1',
            selected: [ELEMENTALS.WATER, ELEMENTALS.AIR, ELEMENTALS.VOID],
            elementals: []
        },
        team2: {
            name: 'Team 1',
            selected: [ELEMENTALS.FIRE, ELEMENTALS.VOID, ELEMENTALS.EARTH],
            elementals: []
        }
    }
}

function drawBoard(ctx, board) {
    for(let i = 0; i <= board.rows; i++) {
        let yPos = board.startY + i * board.tileSize + (i > board.rows / 2 ? 10 : 0)
        ctx.beginPath()
        ctx.moveTo(board.startX, yPos)
        ctx.lineTo(board.startX + board.hzLineLength, yPos)
        if(i == board.rows / 2) {
            ctx.moveTo(board.startX, yPos + 10)
            ctx.lineTo(board.startX + board.hzLineLength, yPos + 10)
        }
        ctx.stroke();
    }
    
    for(let i = 0; i <= board.columns; i++) {
        let xPos = board.startX + i * board.tileSize
        let yPos = board.startY + (board.rows / 2) * board.tileSize + 10
        ctx.beginPath()
        ctx.moveTo(xPos, board.startY)
        ctx.lineTo(xPos, board.startY + board.vtLineLength / 2)
        ctx.moveTo(xPos, yPos)
        ctx.lineTo(xPos, yPos + board.vtLineLength / 2)
        ctx.stroke();
    }
}

function drawSquareHighlight(ctx, row, column) {
    let x = Game.board.startX + (column - 1) * Game.board.tileSize + 3
    let y = Game.board.startY + (row - 1) * Game.board.tileSize + (row > 7 ? 10 : 0) + 3
    ctx.rect(x, y, Game.board.tileSize - 6, Game.board.tileSize - 6)
}

function isValid(square, team) {
    let rows = Game.board.rows
    let columns = Game.board.columns
    if(square.row < 8 && square.row > 0) {
        return square.column > 0 && square.column < columns + 1 ? (team == TEAMS.TEAM_1 ? 1 : 2) : 0
    }
    else if(square.row < rows + 1 && square.row > 7) {
        return square.column > 0 && square.column < columns + 1 ? (team == TEAMS.TEAM_1 ? 2 : 1) : 0
    }
    return 0
}

class Elemental {
    size = 10
    xOffset = 0
    yOffset = -5
    xOffsetLevel = -8
    yOffsetLevel = 16
    
    constructor(type, level, row, column) {
        this.type = type
        this.level = level
        this.row = row
        this.column = column
        this.team = row < 8 ? TEAMS.TEAM_1 : TEAMS.TEAM_2
        this.hasMoved = false
        this.hasAttacked = false
        this.focused = false
        this.moveableTiles = []
        this.attackableTiles = []
        this.hp = 1
        this.damage = 1
    }

    resetForTurn() {
        this.moveableTiles = []
        this.attackableTiles = []
        this.focused = false
        this.hasMoved = false
        this.hasAttacked = false
    }

    focus() {
        this.moveableTiles = []
        this.attackableTiles = []
        if(this.hasMoved && this.hasAttacked) {
            this.focused = false
        }
        else {
            this.updateActionableTiles()
            this.focused = true
        }
        return this.focused
    }

    updateActionableTiles() {
        this.attackableTiles = []
        this.moveableTiles = []
        let range = this.getRange()
        for(let i = -range; i <= range; i++) {
            for(let j = -range; j <= range; j++) {
                var square = {row: this.row + i, column: this.column + j}
                var action = isValid(square, this.team)
                if(action == 2) {
                    this.attackableTiles.push(square)
                }
                else if(action == 1) {
                    var pathLength = Math.abs(i) + Math.abs(j)
                    if(pathLength && pathLength <= range) {
                        this.moveableTiles.push(square)
                    }
                }
            }
        }
        if(this.attackableTiles.length < 1) {
            this.hasAttacked = true
        }
        if(this.moveableTiles.length < 1) {
            this.hasMoved = true
        }
    }

    getRange() {
        // range = level * 2 - 1
        // air elements get a bonus range
        return this.level * 2 - (this.type == ELEMENTALS.AIR ? 0 : 1)
    }

    draw(ctx) {
        let x = Game.board.startX + (this.column - 1) * Game.board.tileSize + Game.board.tileSize / 2
        let y = Game.board.startY + (this.row - 1) * Game.board.tileSize + Game.board.tileSize / 2 + (this.row > 7 ? 10 : 0)
        ctx.fillStyle = this.type
        ctx.beginPath()
        ctx.ellipse(x + this.xOffset, y + this.yOffset, this.size, this.size, 0, 0, 2 * Math.PI)
        ctx.fill()
        ctx.strokeText(`lvl ${this.level}`, x + this.xOffsetLevel, y + this.yOffsetLevel)
    }

    highlightMoves(ctx) {
        ctx.save()
        ctx.strokeStyle = '#03fff7'
        ctx.lineWidth = 5
        ctx.beginPath()
        this.moveableTiles.forEach(function(square) {
            drawSquareHighlight(ctx, square.row, square.column)
        })
        ctx.stroke()
        ctx.restore()
    }

    highlightAttacks(ctx) {
        ctx.save()
        ctx.strokeStyle = '#ff00f7'
        ctx.lineWidth = 5
        ctx.beginPath()
        this.attackableTiles.forEach(function(square) {
            drawSquareHighlight(ctx, square.row, square.column)
        })
        ctx.stroke()
        ctx.restore()
    }

    highlightAvailableActions(ctx) {
        if(!this.hasMoved) {
            this.highlightMoves(ctx)
        }
        if(!this.hasAttacked) {
            this.highlightAttacks(ctx)
        }
    }

    move(row, column) {
        this.row = row
        this.column = column
        this.hasMoved = true
        this.hasAttacked = false
        this.updateActionableTiles()
    }

    attack(row, column) {
        let self = this
        Game.teams[this.team === TEAMS.TEAM_2 ? 'team1' : 'team2'].elementals.forEach(function(other) {
            if(row === other.row && column === other.column) {
                other.attacked(self)
            }
        })
        this.hasMoved = true
        this.hasAttacked = true
    }

    attacked(elemental) {
        this.hp -= elemental.damage
        if(this.hp < 1) {
            let team = Game.teams[this.team === TEAMS.TEAM_1 ? 'team1' : 'team2']
            let index = team.elementals.indexOf(this)
            if(index >= 0) {
                team.elementals.splice(index, 1)
            }
        }
    }
}



function getRandomInt(start, end) {
    if(!end) {
        end = start
        start = 0
    }
    return Math.floor(Math.random() * (end - start)) + start
}

function upgradeElementals(elementals) {

}

function init() {
    let column, row, typeIndex, el;
    for(let i = 0; i < 9; i++) {
        column = getRandomInt(1, Game.board.columns + 1)
        row = getRandomInt(1, Game.board.rows / 2 + 1)
        typeIndex = getRandomInt(Game.teams.team1.selected.length)
        Game.teams.team1.elementals.push(
            new Elemental(Game.teams.team1.selected[typeIndex], LEVELS.LEVEL_1, row, column)
        )
        column = getRandomInt(1, Game.board.columns + 1)
        row = getRandomInt(Game.board.rows, Game.board.rows / 2 + 1)
        typeIndex = getRandomInt(Game.teams.team2.selected.length)
        Game.teams.team2.elementals.push(
            new Elemental(Game.teams.team2.selected[typeIndex], LEVELS.LEVEL_1, row, column)
        )
    }
}

canvas.addEventListener('click', function(event) {
    if(event.offsetY > (Game.board.startY + Game.board.vtLineLength / 2) && event.offsetY < (Game.board.startY + Game.board.vtLineLength / 2 + 10)) {
        return
    }
    let c = Math.ceil((event.offsetX - Game.board.startX) / Game.board.tileSize)
    let r = Math.ceil((event.offsetY - Game.board.startY) / Game.board.tileSize)
    Game.teams[turn === TEAMS.TEAM_2 ? 'team2' : 'team1'].elementals.forEach(function(elemental) {
        if(elemental.focused) {
            if(!elemental.hasAttacked && (turn === TEAMS.TEAM_2 ? r <= Game.board.rows / 2 : r > Game.board.rows / 2)) {
                // check if its a valid attack
                elemental.attack(r, c)
                elemental.focused = false
            }
            else if(!elemental.hasMoved && !(r === elemental.row && c === elemental.column)) {
                // check if its a valid move
                elemental.move(r, c)
            }
            else {
                elemental.focused = false
            }
        }
        else if(elemental.row == r && elemental.column == c) {
            elemental.focus()
        } else {
            elemental.focused = false
        }
    })
});

let turn = TEAMS.TEAM_2
document.getElementById('pass').addEventListener('click', function(event) {
    if(turn === TEAMS.TEAM_2) {
        turn = TEAMS.TEAM_1
    }
    else {
        turn = TEAMS.TEAM_2
    }
    upgradeElementals(Game.teams.team1.elementals)
    upgradeElementals(Game.teams.team2.elementals)
    Game.teams[turn === TEAMS.TEAM_2 ? 'team2' : 'team1'].elementals.forEach(function(elemental) {
        elemental.resetForTurn()
    })
})

init()

// 60 FPS
let start
let FPS = 60
function draw(timestamp) {
    if(!start) {
        start = timestamp
    }
    const elapsed = timestamp - start
    if(elapsed >= 1000 / FPS) {
        context.clearRect(0, 0, canvas.width, canvas.height)
        drawBoard(context, Game.board)
        Game.teams.team1.elementals.forEach(function(elemental) {
            elemental.draw(context)
            if(elemental.focused) {
                elemental.highlightAvailableActions(context)
            }
        })
        Game.teams.team2.elementals.forEach(function(elemental) {
            elemental.draw(context)
            if(elemental.focused) {
                elemental.highlightAvailableActions(context)
            }
        })
    }
    requestAnimationFrame(draw)
}

requestAnimationFrame(draw)