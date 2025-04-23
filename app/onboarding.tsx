import { useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  ViewToken,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

// Define slide interface
interface Slide {
  id: number;
  title: string;
  description: string;
  image: any; // Using any for image source is common in React Native
}

// Sample onboarding data
const slides: Slide[] = [
  {
    id: 1,
    title: "Welcome to Todo App",
    description: "Your simple and elegant solution for managing daily tasks",
    image: require("../assets/onboarding1.png"),
  },
  {
    id: 2,
    title: "Stay Organized",
    description: "Keep track of your tasks and increase your productivity",
    image: require("../assets/onboarding2.png"),
  },
  {
    id: 3,
    title: "Achieve Your Goals",
    description: "Complete tasks on time and reach your goals faster",
    image: require("../assets/onboarding3.png"),
  },
];

// Onboarding slide component
const OnboardingItem = ({ item }: { item: Slide }) => {
  return (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

// Pagination component
const Pagination = ({
  data,
  scrollX,
}: {
  data: Slide[];
  scrollX: Animated.SharedValue<number>;
}) => {
  return (
    <View style={styles.paginationContainer}>
      {data.map((_, i: number) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const animatedDotStyle = useAnimatedStyle(() => {
          const width = interpolate(
            scrollX.value,
            inputRange,
            [8, 16, 8],
            "clamp"
          );

          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.5, 1, 0.5],
            "clamp"
          );

          return {
            width,
            opacity,
          };
        });

        return (
          <Animated.View
            key={`dot-${i}`}
            style={[styles.dot, animatedDotStyle]}
          />
        );
      })}
    </View>
  );
};

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList<Slide>>(null);
  const router = useRouter();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  type ViewableItemsChangedInfo = {
    viewableItems: ViewToken[];
    changed: ViewToken[];
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: ViewableItemsChangedInfo) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("onboarded", "true");
      router.replace("/");
    } catch (error) {
      console.log("Error saving onboarding status:", error);
    }
  };

  const handleSkip = () => {
    flatListRef.current?.scrollToIndex({
      index: slides.length - 1,
      animated: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => <OnboardingItem item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id.toString()}
        onScroll={scrollHandler}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      <Pagination data={slides} scrollX={scrollX} />

      <View style={styles.bottomContainer}>
        {currentIndex < slides.length - 1 ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={completeOnboarding}
            style={styles.getStartedButton}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  slide: {
    width,
    height,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 0.4,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    paddingHorizontal: 24,
  },
  paginationContainer: {
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f59e0b",
    marginHorizontal: 4,
  },
  bottomContainer: {
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  skipButton: {
    padding: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: "#666",
  },
  nextButton: {
    backgroundColor: "#f59e0b",
    padding: 12,
    borderRadius: 8,
    width: 100,
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  getStartedButton: {
    backgroundColor: "#f59e0b",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  getStartedButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
