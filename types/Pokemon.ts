/** PokeAPI `pokemon.types[]` entry */
export interface PokemonTypeSlot {
  slot: number;
  type: { name: string; url: string };
}

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonTypeSlot[];
  image: string;
}

export interface PokemonDetails extends Pokemon {
  height: number;
  weight: number;
  description: string;
}

export type RootStackParamList = {
  Home: undefined;
  Details: { pokemon: Pokemon };
};