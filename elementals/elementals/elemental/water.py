from .base import BaseElemental
import random


class WaterElemental(BaseElemental):
    race = "water"
    statistics = BaseElemental.statistics[race]

    def __init__(self, rank, row, column):
        super(WaterElemental, self).__init__(rank, row, column)
        self.update()
    
    def __str__(self):
        return 'WaterElemental (rank={}, row={}, column={}, hp={})'.format(self.rank, self.row, self.column, self.hp)
        
    def update(self):
        super(WaterElemental, self).update(self.statistics[str(self.rank)])

    def upgrade(self):
        self.rank += 1
        self.update()

    def do_attack(self, team, row, column):
        """
        Passive: Does 1.5x damge against fire units
        Level 3 Bonus: Does 50% splash damage to surrounding units around main target
        """
        main = team.at(row, column)
        score = 0
        if main:
            hit = self.attack * (1.5 if main.race == "fire" else 1)
            if not main.damage(hit):
                score = main.rank
            if self.rank == 3:
                for i in range(-1, 2):
                    for j in range(-1, 2):
                        if i != 0 or j != 0:
                            adjacent = team.at(row + i, column + j)
                            if adjacent:
                                hit = self.attack * (0.75 if main.race == "fire" else 0.5)
                                if not adjacent.damage(hit):
                                    score += adjacent.rank
        self.has_attacked = True
        return score
