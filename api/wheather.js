import axios from "axios";
import { apiKey } from "../constants";

const forecastEndpoint = (params) =>
  `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}&aqi=${params.days}no`;
const locationEndpoint = (params) =>
  `http://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;

const apiCall = async (endpoint) => {
  const options = {
    method: "GET",
    url: endpoint,
  };
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (err) {
    console.log("error:", err);
    return null;
  }
};

export const fetchWeatherForecast = (parms) => {
  return apiCall(forecastEndpoint(parms));
};
export const fetchLocations = (parms) => {
  return apiCall(locationEndpoint(parms));
};
