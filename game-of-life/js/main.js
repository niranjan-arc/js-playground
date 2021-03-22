// document.onload(event)



let R = 150
let C = 70

let neighbours = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1]
]

let generation = 0
function evolve(state) {
    generation++;
    let next = []
    state.forEach((r) => next.push(r.slice()))
    for(let i = 1; i < R - 1; ++i) {
        for(let j = 1; j < C - 1; ++j) {
            let alive = 0
            neighbours.forEach((n) => {
                if(state[i + n[0]][j + n[1]]) {
                    alive += 1
                }
            })
            if(state[i][j]) {
                if(alive === 2 || alive === 3) {
                    next[i][j] = true
                }
                else {
                    next[i][j] = false
                }
            }
            else if(alive === 3) {
                next[i][j] = true
            }
            else {
                next[i][j] = state[i][j]
            }
        }
    }
    return next
}

let c = document.getElementById('game-of-life')
let cc = c.getContext('2d')

c.width = window.innerWidth
c.height = window.innerHeight


let state = []
for(let i = 0; i < R; ++i) {
    let row = []
    for(let j = 0; j < C; ++j) {
        row.push(false)
    }
    state.push(row)
}


function draw(state) {
    cc.clearRect(0, 0, c.width, c.height)
    state.forEach((row, i) => {
        row.forEach((column, j) => {
            if(column) {
                cc.fillRect(i * 10, j * 10, 10, 10)
            }
            else {
                cc.strokeRect(i * 10, j * 10, 10, 10)
            }
        })
    })
}

function start() {
    state = evolve(state)
    draw(state)
}

let handle;

document.addEventListener('keydown', event => {
    if(event.key === "r") {
        draw(state)
    }
    else if(event.key === "n") {
        state = evolve(state)
        draw(state)
    }
    else if(event.key === "s") {
        if(handle) {
            clearInterval(handle)
            handle = null
        }
        else {
            handle = setInterval(start, 100)
        }
    }
})

c.addEventListener('mousedown', event => {
    let i = parseInt(event.x / 10)
    let j = parseInt(event.y / 10)

    if(i > 0 && i < R && j > 0 && j < C) {
        state[i][j] = !state[i][j]
        draw(state)
    }
})

draw(state)