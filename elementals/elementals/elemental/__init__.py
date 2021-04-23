from .water import WaterElemental
from .air import AirElemental
from .earth import EarthElemental
from .fire import FireElemental
from .void import VoidElemental


def Elemental(race, row, column, rank=1):
    if rank not in [1, 2, 3]:
        raise ValueError("Required 1 <= rank <= 3. Given rank = %s" % rank)
    if race == 'air':
        return AirElemental(rank, row, column)
    if race == 'fire':
        return FireElemental(rank, row, column)
    if race == 'water':
        return WaterElemental(rank, row, column)
    if race == 'earth':
        return EarthElemental(rank, row, column)
    if race == 'void':
        return VoidElemental(rank, row, column)