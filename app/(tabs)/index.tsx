import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";
import TrendingCard from "@/components/TrendingCard";
import { useState } from "react";

const Index = () => {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>();
  const regions = ["all", "pakistani", "bollywood", "south", "hollywood"];

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(getTrendingMovies);

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: "", region: selectedRegion }), {
    dependencies: [selectedRegion],
  });

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1">
        <Image source={images.bg} className="absolute w-full z-0" resizeMode="cover" />

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
        >
          <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

          {(moviesLoading || trendingLoading) ? (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              className="mt-10 self-center"
            />
          ) : (moviesError || trendingError) ? (
            <Text className="text-white text-center mt-10">
              {moviesError?.message || trendingError?.message}
            </Text>
          ) : (
            <View className="flex-1 mt-5">
              <SearchBar
                onPress={() => router.push("/search")}
                placeholder="Search for a movie"
              />

              <View className="mt-5 mb-3">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 10 }}
                >
                  {regions.map((region) => {
                    const isActive = selectedRegion === region || (region === "all" && !selectedRegion);
                    return (
                      <TouchableOpacity
                        key={region}
                        onPress={() => setSelectedRegion(region === "all" ? undefined : region)}
                        className={`px-4 py-2 mr-3 rounded-full border ${
                          isActive ? "bg-white border-white" : "border-gray-400"
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            isActive ? "text-primary" : "text-white"
                          }`}
                        >
                          {region === "all" ? "All" : region.charAt(0).toUpperCase() + region.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {trendingMovies && (
                <View className="mt-10">
                  <Text className="text-lg text-white font-bold mb-3">
                    Trending Movies
                  </Text>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-4 mt-3"
                    data={trendingMovies}
                    contentContainerStyle={{ gap: 26 }}
                    renderItem={({ item, index }) => (
                      <TrendingCard movie={item} index={index} />
                    )}
                    keyExtractor={(item) => item.movie_id.toString()}
                    ItemSeparatorComponent={() => <View className="w-4" />}
                  />
                </View>
              )}

              <Text className="text-lg text-white font-bold mt-5 mb-3">
                Latest Movies
              </Text>

              <FlatList
                data={movies}
                renderItem={({ item }) => <MovieCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "flex-start",
                  gap: 20,
                  paddingRight: 5,
                  marginBottom: 10,
                }}
                className="mt-2 pb-32"
                scrollEnabled={false}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Index;
