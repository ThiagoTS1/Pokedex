import axios from 'axios';

const api = axios.create({
  baseURL: 'https://pokeapi.co/api/v2/',
});

export const getPokemons = async (limit: number = 30, offset: number = 0) => {
  try {
    const response = await api.get(`pokemon?limit=${limit}&offset=${offset}`);
    return response.data.results;
  } catch (error) {
    throw new Error('Erro ao buscar lista');
  }
};

export const getPokemonDetails = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error('Erro ao buscar detalhes');
  }
};

export const getPokemonSpecies = async (id: number) => {
  try {
    const response = await api.get(`pokemon-species/${id}`);
    const entry = response.data.flavor_text_entries.find(
      (entry: any) => entry.language.name === 'en'
    );
    return entry ? entry.flavor_text.replace(/[\n\f]/g, ' ') : 'Descrição indisponível.';
  } catch (error) {
    return 'Descrição indisponível.';
  }
};