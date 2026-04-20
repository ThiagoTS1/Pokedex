import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getPokemonDetails, getPokemons } from '../services/api';
import { Pokemon, RootStackParamList } from '../types/Pokemon';
import { PokemonCard } from '../components/PokemonCard';

export const PokedexScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const list = await getPokemons(30, 0);
        const details = await Promise.all(
          list.map(async (pokemon: any) => {
            const response = await getPokemonDetails(pokemon.url);
            return {
              id: response.id,
              name: response.name,
              types: response.types,
              image: response.sprites.other['official-artwork'].front_default || response.sprites.front_default,
            };
          })
        );
        setPokemons(details);
      } catch (err) {
        setError('Falha ao carregar Pokémons. Verifique sua conexão.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const loadMorePokemons = async () => {
    if (isFetchingMore || isLoading || search.trim().length > 0) return;
    try {
      setIsFetchingMore(true);
      const newOffset = offset + 30;
      const list = await getPokemons(30, newOffset);
      const details = await Promise.all(
        list.map(async (pokemon: any) => {
          const response = await getPokemonDetails(pokemon.url);
          return {
            id: response.id,
            name: response.name,
            types: response.types,
            image: response.sprites.other['official-artwork'].front_default || response.sprites.front_default,
          };
        })
      );
      setPokemons((prev) => [...prev, ...details]);
      setOffset(newOffset);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const filteredPokemons = useMemo(
    () => pokemons.filter((p) => p.name.toLowerCase().includes(search.toLowerCase().trim())),
    [pokemons, search]
  );

  const renderEmptyList = () => {
    if (isLoading || error) return null;
    if (search.trim().length > 0) {
      return <Text style={styles.empty}>Nenhum Pokémon encontrado para '{search}'.</Text>;
    }
    return <Text style={styles.empty}>Nenhum Pokémon para exibir no momento.</Text>;
  };

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.title}>Pokedex</Text>
      <TextInput
        placeholder="Buscar pokemon..."
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />
      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF0000" />
          <Text style={styles.loadingText}>Carregando Pokémons...</Text>
        </View>
      )}
      {error && !isLoading && (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
      {!isLoading && !error && (
        <FlatList
          data={filteredPokemons}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PokemonCard 
              pokemon={item} 
              onPress={() => navigation.navigate('Details', { pokemon: item })} 
            />
          )}
          ListEmptyComponent={renderEmptyList}
          onEndReached={loadMorePokemons}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  input: { backgroundColor: '#f1f1f1', padding: 12, borderRadius: 8, marginBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  list: { paddingBottom: 24 },
  error: { textAlign: 'center', color: '#b00020', fontSize: 16, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: '#666', fontSize: 16 },
  footer: { paddingVertical: 20, justifyContent: 'center', alignItems: 'center' },
});