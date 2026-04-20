import type { PokemonTypeSlot } from '../types/Pokemon';

export const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const formatPokemonTypesLabel = (types: PokemonTypeSlot[]) =>
  [...types]
    .sort((a, b) => a.slot - b.slot)
    .map((t) => capitalize(t.type.name))
    .join(' • ');
