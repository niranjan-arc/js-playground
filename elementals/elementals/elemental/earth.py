from .base import BaseElemental
import random


class EarthElemental(BaseElemental):
    race = "earth"
    statistics = BaseElemental.statistics[race]

    def __init__(self, rank, row, column):
        super(EarthElemental, self).__init__(rank, row, column)
        self.update()
    
    def __str__(self):
        return 'EarthElemental (rank={}, row={}, column={}, hp={})'.format(self.rank, self.row, self.column, self.hp)
        
    def update(self):
        super(EarthElemental, self).update(self.statistics[str(self.rank)])

    def upgrade(self):
        self.rank += 1
        self.update()

    def damage(self, hit):
        """
        Passive: 50% chance for lethal damage to deal half of current hp as damage (min 
        health after taking hit can't be < 1)
        """
        protection_chance = 0.5
        prev_hp = self.hp
        self.hp -= hit
        if self.hp <= 0:
            if random.random() <= protection_chance:
                self.hp = max(1, self.hp / 2)
            else:
                self.hp = 0
                self.is_alive = False
        return self.is_alive

    def do_attack(self, team, row, column):
        """
        Level 3 Bonus: Blocks board position if target dies
        """
        main = team.at(row, column)
        score = 0
        if main:
            is_alive = main.damage(self.attack)
            if self.rank == 3 and not main.is_alive:
                team.block(main.row, main.column)
            if not is_alive:
                score = main.rank
        self.has_attacked = True
        return score
