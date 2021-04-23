from .base import BaseElemental
import random


class VoidElemental(BaseElemental):
    race = "void"
    statistics = BaseElemental.statistics[race]

    def __init__(self, rank, row, column):
        """
        Level 3 Bonus: In-built max movement and range
        """
        super(VoidElemental, self).__init__(rank, row, column)
        self.update()
    
    def __str__(self):
        return 'VoidElemental (rank={}, row={}, column={}, hp={})'.format(self.rank, self.row, self.column, self.hp)
        
    def update(self):
        super(VoidElemental, self).update(self.statistics[str(self.rank)])

    def upgrade(self):
        self.rank += 1
        self.update()

    def damage(self, hit):
        """
        Passive: 20%/30%/40% chance based on rank to miss the hit.
        """
        miss_chance = (self.rank + 1) * 0.1
        if random.random() <= miss_chance:
            return
        self.hp -= hit
        if self.hp <= 0:
            self.hp = 0
            self.is_alive = False
        return self.is_alive
    
    def do_attack(self, team, row, column):
        main = team.at(row, column)
        score = 0
        if main:
            is_alive = main.damage(self.attack)
            if not is_alive:
                score = main.rank
        self.has_attacked = True
        return score
