from .base import BaseElemental
import random


class AirElemental(BaseElemental):
    race = "air"
    statistics = BaseElemental.statistics[race]

    def __init__(self, rank, row, column):
        """
        Passive: In-built passive bonus to movement and range
        """
        super(AirElemental, self).__init__(rank, row, column)
        self.update()
    
    def __str__(self):
        return 'AirElemental (rank={}, row={}, column={}, hp={})'.format(self.rank, self.row, self.column, self.hp)
        
    def update(self):
        super(AirElemental, self).update(self.statistics[str(self.rank)])

    def upgrade(self):
        self.rank += 1
        self.update()

    def do_attack(self, team, row, column):
        """
        Level 3 Bonus: Does damage and moves units one tile back, if they can't be moved due to any reason
        does 2x damge instead
        """
        main = team.at(row, column)
        score = 0
        if main:
            hit = self.attack
            if self.rank == 3:
                if 0 <= (row + 1) < team.rows \
                    and 0 <= column < team.columns \
                    and team.board[row + 1][column] is None:
                    main.move(team.board, row + 1, column)
                else:
                    hit *= 2
            is_alive = main.damage(hit)
            if not is_alive:
                score = self.rank
        self.has_attacked = True
        return score
