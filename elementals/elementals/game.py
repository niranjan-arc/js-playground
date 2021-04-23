from elemental import Elemental
from elemental.base import BaseElemental

import random


class Team:
    rows = 7
    columns = 19
    initial_count = 9

    def __init__(self, team_id, name, options):
        self.name = name
        self.team_id = team_id
        self.options = options
        self.board = [[None] * self.columns for i in range(self.rows)]
        self.highlighted = []
        self.selected = None
        self.turn = 0
        self.score = 0
        self._setup_board()

    def remove_dead(self):
        for i in range(self.rows):
            for j in range(self.columns):
                tile = self.at(i, j)
                if isinstance(tile, BaseElemental):
                    if not tile.is_alive:
                        tile = None
                        self.board[i][j] = None

    def get_state(self):
        state = {
            'team': self.team_id,
            'score': self.score,
            'board': {
                'rows': self.rows,
                'columns': self.columns,
                'tiles': [],
                'highlighted': self.highlighted
            }
        }
        for i in range(self.rows):
            for j in range(self.columns):
                tile = self.at(i, j)
                if tile is not None:
                    if isinstance(tile, BaseElemental):
                        state['board']['tiles'].append({
                            'row': i,
                            'column': j,
                            'type': 'elemental',
                            'rank': tile.rank,
                            'race': tile.race,
                            'hp': tile.hp/tile.max_hp,
                            'selected': tile.is_selected,
                            'attacked': tile.has_attacked,
                            'moved': tile.has_moved
                        })
                    elif isinstance(tile, int):
                        state['board']['tiles'].append({
                            'row': i,
                            'column': j,
                            'type': 'static',
                            'id': tile
                        })
        return state

    def spawn(self):
        race = random.choice(self.options)
        r = int(self.rows - 1)
        available = []
        for j in range(self.columns):
            if self.board[r][j] is None:
                available.append(j)
        if len(available) > 0:
            c =  random.choice(available)
            self.board[r][c] = Elemental(race, r, c)

    def set_turn(self):
        self.highlighted = []
        self.selected = None
        for i in range(self.rows):
            for j in range(self.columns):
                el = self.board[i][j]
                if el:
                    el.set_turn()
        if self.turn > 0:
            self.spawn()
        return self.team_id

    def _setup_board(self):
        added = 0
        while True:
            race = random.choice(self.options)
            r = int(random.random() * self.rows)
            c = int(random.random() * self.columns)
            if self.board[r][c] is None:
                added += 1
                self.board[r][c] = Elemental(race, r, c)
            if added == self.initial_count:
                break
    
    def block(self, row, column):
        if 0 <= row < self.rows and 0 <= column < self.columns:
            self.board[row][column] = 0

    def is_valid(self, row, column):
        return 0 <= row < self.rows and 0 <= column < self.columns

    def at(self, row, column):
        if self.is_valid(row, column):
            return self.board[row][column]
        return None

    def set_highlighted(self):
        el = self.selected
        self.highlighted = []
        m_range = el.movement
        for i in range(-m_range, m_range + 1):
            for j in range(-m_range, m_range + 1):
                row = el.row + i
                column = el.column + j
                if self.is_valid(row, column):
                    length = abs(i) + abs(j)
                    if length and length <= m_range:
                        self.highlighted.append((row, column))

    def set_highlighted_for_target(self, el:BaseElemental=None):
        self.highlighted = []
        if el:
            r = el.row - el.range
            if r < 0:
                left = el.column - el.range
                right = el.column + el.range
                r = abs(r)
                for i in range(r):
                    for j in range(left, right + 1):
                        if self.is_valid(i, j):
                            self.highlighted.append((i, j))

    def select(self, row, column):
        el = self.at(row, column)
        if el and not el.has_attacked:
            el.select()
            self.selected = el
            if not el.has_moved:
                self.set_highlighted()
            else:
                self.highlighted = []
            return el
        else:
            self.selected = None
            self.highlighted = []
            return None

    def upgrade(self):
        if self.selected:
            self.selected.set_turn()
            self.highlighted = []
            self.selected = None
        self.turn += 1
        # print('Calling upgrade on ', self.name)
        for i in range(self.rows):
            for j in range(self.columns):
                first = self.at(i, j)
                if first and first.rank < 3:
                    second = self.at(i + 1, j)
                    if second and second.rank == first.rank and second.race == first.race:
                        third = self.at(i + 2, j)
                        if third and third.rank == first.rank and third.race == first.race:
                            self.board[i][j] = None
                            self.board[i + 2][j] = None
                            second.upgrade()
                    else:
                        second = self.at(i, j + 1)
                        if second and second.rank == first.rank and second.race == first.race:
                            third = self.at(i, j + 2)
                            if third and third.rank == first.rank and third.race == first.race:
                                self.board[i][j] = None
                                self.board[i][j + 2] = None
                                second.upgrade()

    def move(self, row, column):
        if 0 <= row < self.rows \
            and 0 <= column < self.columns \
            and self.board[row][column] is None \
            and self.selected:
            if not self.selected.has_moved:
                self.selected.move(self.board, row, column)
                self.highlighted = []

    def attack(self, team, row, column):
        if self.selected and not self.selected.has_attacked:
            self.score += self.selected.do_attack(team, row, column)
            team.remove_dead()
            self.selected.has_moved = True
            self.selected.select(is_selected=False)
            self.selected = None
            self.highlighted = []

    def attacked(self, elemental, r, c):
        if self.board[r][c]:
            target = self.board[r][c]
            target.attacked(elemental)
