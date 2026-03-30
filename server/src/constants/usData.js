import { City, State } from 'country-state-city';

const USA_ISO = 'US';

export function getUsStates() {
  return State.getStatesOfCountry(USA_ISO)
    .map((state) => ({
      code: state.isoCode,
      name: state.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getUsCities(stateCode = null) {
  const allCities = stateCode
    ? City.getCitiesOfState(USA_ISO, stateCode)
    : City.getCitiesOfCountry(USA_ISO);

  return allCities
    .map((city) => ({
      name: city.name,
      stateCode: city.stateCode,
      countryCode: city.countryCode,
      latitude: city.latitude,
      longitude: city.longitude,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
