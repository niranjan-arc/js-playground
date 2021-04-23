from game import Team

import asyncio
import json
import logging
import websockets



GAME_STATES = {
    "initilized": 1,
    "waiting": 2,
    "started": 3,
    "closed": 4
}


# team1 = Team("TRed1", ["water", "earth", "void"])
# team2 = Team("TRed2", ["water", "fire", "air"])
team1 = None
team2 = None
STATE = GAME_STATES["initilized"]
TURN = None


logging.basicConfig(level=logging.INFO)

USERS = set()


def state_event():
    if team1 and team2:
        return json.dumps({"type": "state", 'teams': [team1.get_state(), team2.get_state()], "turn": TURN})
    else:
        return json.dumps({"type": "connect", "message": "Waiting for players..."})


async def notify_state():
    if USERS:  # asyncio.wait doesn't accept an empty list
        message = state_event()
        await asyncio.wait([user.send(message) for user in USERS])


async def notify_pass():
    if USERS and TURN:
        message = json.dumps({"type": "pass", "turn": TURN})
        await asyncio.wait([user.send(message) for user in USERS])
        await notify_state()


async def notify_connect(name):
    if USERS:
        message = json.dumps({"type": "connect", "message": "%s connected!" % name})
        await asyncio.wait([user.send(message) for user in USERS])

async def register(websocket):
    USERS.add(websocket)


async def connect(session_id, name, choice):
    global team1
    global team2
    global STATE
    global TURN
    if team1 is None:
        team1 = Team(session_id, name, choice)
        STATE = GAME_STATES["waiting"]
        await notify_connect(name)
    elif team2 is None:
        team2 = Team(session_id, name, choice)
        STATE = GAME_STATES["started"]
        TURN = team1.team_id
        await notify_state()
        # await notify_connect(name)


async def unregister(websocket):
    global game1
    global game2
    global STATE
    print('Connection closed')
    USERS.remove(websocket)
    STATE = GAME_STATES["closed"]
    game1 = None
    game2 = None
    # await notify_users()


async def counter(websocket, path):
    global STATE
    global team1
    global team2
    global TURN
    # register(websocket) sends user_event() to websocket
    await register(websocket)
    try:
        await websocket.send(state_event())
        async for message in websocket:
            data = json.loads(message)
            if STATE == GAME_STATES["started"]:
                current = team1 if TURN == team1.team_id else team2
                other = team2 if TURN == team1.team_id else team1
                if data['team'] == current.team_id:
                    if data["type"] == "click":
                        if current.selected:
                            if current.is_valid(*data['at']):
                                el = current.at(*data['at'])
                                if el and el is not current.selected:
                                    current.selected.select(is_selected=False)
                                    current.select(*data['at'])
                                    other.set_highlighted_for_target(current.selected)
                                elif tuple(data['at']) in current.highlighted:
                                    current.move(*data['at'])
                                    other.set_highlighted_for_target(current.selected)
                                    if len(other.highlighted) == 0:
                                        current.selected.has_attacked = True
                                        current.selected.select(is_selected=False)
                                        current.selected = None
                                else:
                                    current.selected.select(is_selected=False)
                                    current.select(-1, -1)
                                    other.set_highlighted_for_target()
                            else:
                                # enemy indices starts with -1 and are negative
                                enemy_pos = (abs(data['at'][0] + 1), data['at'][1])
                                if enemy_pos in other.highlighted:
                                    current.attack(other, abs(data['at'][0] + 1), data['at'][1])
                                    other.set_highlighted_for_target()
                                else:
                                    # TODO: Give visual/auditory que that user has done invalid action
                                    pass
                        else:
                            el = current.select(*data['at'])
                            if el:
                                other.set_highlighted_for_target(el)
                        await notify_state()
                    elif data["type"] == "pass":
                        TURN = other.set_turn()
                        current.upgrade()
                        await notify_state()
                    else:
                        logging.error("current state: %s, unsupported event: %s", STATE, data)
            else:
                if data["type"] == "connect":
                    await connect(data['id'], data['name'], data['choice'])
                else:
                    logging.error("current state: %s, unsupported event: %s", STATE, data)
    finally:
        await unregister(websocket)



start_server = websockets.serve(counter, "localhost", 6789)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()


# TODO:
# 2. Score system