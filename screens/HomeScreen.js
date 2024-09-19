import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../theme";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/wheather";
import { weatherImages } from "../constants";
import { getData, storeData } from "../utils/asyncstorage";
import * as Progress from "react-native-progress";

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocation] = useState();
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = (loc) => {
    setLocation([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      storeData("city", loc.name);
    });
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => {
        setLocation(data);
      });
    }
  };

  useEffect(() => {
    fetchMyweatherData();
  }, []);

  const fetchMyweatherData = async () => {
    let myCity = await getData("city");
    let cityName = "Tashkent";
    if (myCity) cityName = myCity;

    fetchWeatherForecast({
      cityName,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location } = weather;

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        resizeMode="cover"
        blurRadius={50}
        source={require("../assets/images/bg.png")}
        style={styles.backgroundImage}
      >
        {loading ? (
          <View style={styles.loadingView}>
            <Progress.CircleSnail thickness={10} size={150} color="#0bb3b2" />
          </View>
        ) : (
          <SafeAreaView style={{ display: "flex", flex: 1 }}>
            <View style={styles.inputView}>
              <View
                style={[
                  styles.input,
                  showSearch && { backgroundColor: theme.bgWhite(0.2) },
                ]}
              >
                {showSearch ? (
                  <TextInput
                    placeholder="Search City"
                    placeholderTextColor={"lightgray"}
                    style={styles.textInput}
                    onChangeText={handleTextDebounce}
                  />
                ) : null}
                <TouchableOpacity
                  onPress={() => toggleSearch(!showSearch)}
                  style={styles.searchButton}
                >
                  <MagnifyingGlassIcon size={25} color="white" />
                </TouchableOpacity>
              </View>
              {locations?.length > 0 && showSearch ? (
                <View style={styles.searchView}>
                  {locations.map((loc, index) => {
                    const showBorder = index + 1 != locations.length;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.locationsButton,
                          showBorder && {
                            borderBottomWidth: 2,
                            borderBottomColor: "gray",
                          },
                        ]}
                        onPress={() => handleLocation(loc)}
                      >
                        <MapPinIcon size={20} color="gray" />
                        <Text>
                          {loc?.name}, {loc?.country}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>
            {/* forecast section */}
            <View style={styles.forecastView}>
              {/* location */}
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <Text style={styles.forecastText}>{location?.name},</Text>
                <Text style={styles.textSec}>{" " + location?.country}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Image
                  source={weatherImages[current?.condition?.text]}
                  style={{ width: 150, height: 150 }}
                />
              </View>
              <View>
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    color: "white",
                    fontSize: 40,
                    marginLeft: 5,
                  }}
                >
                  {current?.temp_c}&#176;
                </Text>
                <Text
                  style={{ textAlign: "center", color: "white", margin: 5 }}
                >
                  {current?.condition?.text}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "90%",
                  left: 10,
                }}
              >
                <Image
                  source={require("../assets/icons/wind.png")}
                  style={{ width: 40, height: 40 }}
                />
                <Text style={styles.text}>{current?.wind_kph}km</Text>
                <Image
                  source={require("../assets/icons/drop.png")}
                  style={{ width: 40, height: 40 }}
                />
                <Text style={styles.text}>{current?.humidity}%</Text>
                <Image
                  source={require("../assets/icons/sun.png")}
                  style={{ width: 40, height: 40 }}
                />
                <Text style={styles.text}>
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
            <View style={styles.nextDayView}>
              <View style={styles.secondView}>
                <CalendarDaysIcon size={42} color="white" />
                <Text style={styles.nextDayText}>Daily forecast</Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  display: "flex",
                  marginHorizontal: 10,
                }}
                showsHorizontalScrollIndicator={false}
              >
                {weather?.forecast?.forecastday?.map((item, index) => {
                  const date = new Date(item.date);
                  const options = { weekday: "long" };
                  const dayName = date.toLocaleDateString("en-US", options);
                  return (
                    <View style={styles.view} key={index}>
                      <Image
                        source={weatherImages[item?.day?.condition?.text]}
                        style={styles.rainiImage}
                      />
                      <Text style={styles.weeksText}>{dayName}</Text>
                      <Text style={styles.numberText}>
                        {item?.day?.avgtemp_c}&#176;
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, paddingBottom: 50 },
  inputView: {
    paddingLeft: 20,
    paddingRight: 20,
    height: "10%",
    marginHorizontal: 4,
    position: "relative",
  },
  input: {
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row",
    borderRadius: 25,
    paddingLeft: 15,
  },
  textInput: {
    fontSize: 18,
    color: "white",
    flex: 1,
  },
  searchButton: {
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.bgWhite(0.3),
    padding: 10,
    margin: 4,
  },
  searchView: {
    position: "absolute",
    width: "100%",
    backgroundColor: "white",
    top: 56,
    borderRadius: 25,
    left: 20,
    padding: 5,
  },
  locationsButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  forecastView: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  forecastText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  textSec: {
    fontWeight: "semibold",
    fontSize: 15,
    color: "white",
    top: 2,
  },
  text: {
    color: "white",
    right: 20,
    fontSize: 15,
  },
  nexDayView: {
    marginBottom: 2,
    padding: 2,
  },
  secondView: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 30,
  },
  nextDayText: {
    color: "white",
    left: 10,
    fontSize: 15,
  },
  view: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 100,
    borderRadius: 10,
    backgroundColor: theme.bgWhite(0.15),
    marginRight: 15,
  },
  rainiImage: {
    width: 50,
    height: 50,
  },
  weeksText: {
    color: "white",
  },
  numberText: {
    color: "white",
    fontWeight: "semibold",
  },
  loadingView: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 25,
  },
});
