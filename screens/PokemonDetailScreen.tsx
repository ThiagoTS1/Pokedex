import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList, PokemonDetails } from '../types/Pokemon';
import { getPokemonDetails, getPokemonSpecies } from '../services/api';
import { capitalize, formatPokemonTypesLabel } from '../utils/format';

type DetailsScreenRouteProp = RouteProp<RootStackParamList, 'Details'>;

export const PokemonDetailScreen = () => {
  const route = useRoute<DetailsScreenRouteProp>();
  const { pokemon } = route.params;
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExtraDetails = async () => {
      try {
        const rawDetails = await getPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
        const description = await getPokemonSpecies(pokemon.id);
        setDetails({
          ...pokemon,
          height: rawDetails.height / 10,
          weight: rawDetails.weight / 10,
          description,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExtraDetails();
  }, [pokemon.id]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: pokemon.image }} style={styles.image} resizeMode="contain" />
      </View>
      <Text style={styles.name}>{capitalize(pokemon.name)}</Text>
      <Text style={styles.types}>{formatPokemonTypesLabel(pokemon.types)}</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#FF0000" style={styles.loading} />
      ) : details ? (
        <View style={styles.statsContainer}>
          <View style={styles.row}>
            <Text style={styles.statLabel}>Altura:</Text>
            <Text style={styles.statValue}>{details.height} m</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.statLabel}>Peso:</Text>
            <Text style={styles.statValue}>{details.weight} kg</Text>
          </View>
          <Text style={styles.descriptionTitle}>Descrição:</Text>
          <Text style={styles.description}>{details.description}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  imageContainer: { width: 200, height: 200, backgroundColor: '#f5f5f5', borderRadius: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 4 },
  image: { width: 160, height: 160 },
  name: { fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  types: { fontSize: 18, color: '#666', marginBottom: 24 },
  loading: { marginTop: 40 },
  statsContainer: { width: '100%', backgroundColor: '#f9f9f9', padding: 20, borderRadius: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
  statLabel: { fontSize: 16, color: '#666', fontWeight: 'bold' },
  statValue: { fontSize: 16, color: '#333' },
  descriptionTitle: { fontSize: 16, color: '#666', fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  description: { fontSize: 16, color: '#444', lineHeight: 24, textAlign: 'justify' },
});