from .base import BaseElemental
import random


class FireElemental(BaseElemental):
    race = "fire"
    statistics = BaseElemental.statistics[race]

    def __init__(self, rank, row, column):
        super(FireElemental, self).__init__(rank, row, column)
        self.update()
    
    def __str__(self):
        return 'FireElemental (rank={}, row={}, column={}, hp={})'.format(self.rank, self.row, self.column, self.hp)
        
    def update(self):
        super(FireElemental, self).update(self.statistics[str(self.rank)])

    def upgrade(self):
        self.rank += 1
        self.update()
    
    def move(self, board, row, column):
        """
        Passive: 40% chance to create a lower rank fire at original location for rank > 1 units
        """
        create_chance = 0.4
        if self.rank > 1 and random.random() <= create_chance:
            board[self.row][self.column] = FireElemental(self.rank - 1, self.row, self.column)
        else:
            board[self.row][self.column] = None
        self.row, self.column = row, column
        board[row][column] = self
        self.has_moved = True

    def do_attack(self, team, row, column):
        """
        Level 3 Bonus: 75% chance to deal 1.5x Critical Damage
        """
        critical_chance = 0.75
        main = team.at(row, column)
        score = 0
        if main:
            hit = self.attack
            if self.rank == 3 and random.random() < critical_chance:
                hit *= 1.5
            is_alive = main.damage(hit)
            if not is_alive:
                score = main.rank
        self.has_attacked = True
        return score
