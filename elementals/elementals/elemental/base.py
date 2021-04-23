import json


with open('game.json', 'r') as fp:
    stats = json.load(fp)

class BaseElemental:
    statistics = stats['elemental']
    def __init__(self, rank, row, column):
        self.rank = rank
        self.row = row
        self.column = column
        # base values
        self.is_selected = False
        self.has_moved = False
        self.has_attacked = False
        self.is_alive = True
        self.max_hp = 1
        self.hp = 1
        self.attack = 1
        self.range = 1
        self.movement = 1

    def __str__(self):
        return 'Elemental (rank={}, row={}, column={}, hp={})'.format(self.rank, self.row, self.column, self.hp)

    def set_turn(self):
        self.is_selected = False
        self.has_moved = False
        self.has_attacked = False

    def select(self, is_selected=True):
        self.is_selected = is_selected

    def move(self, board, row, column):
        board[row][column] = self
        board[self.row][self.column] = None
        self.row, self.column = row, column
        self.has_moved = True
    
    def update(self, stats):
        self.max_hp = stats['hp']
        self.hp = self.max_hp
        self.attack = stats['attack']
        self.range = stats['range']
        self.movement = stats['movement']
    
    def damage(self, hit):
        self.hp -= hit
        if self.hp <= 0:
            self.hp = 0
            self.is_alive = False
        return self.is_alive
