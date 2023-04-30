// Options for calls to GeoDB
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '187edf7988msh71648752f018815p194247jsn19f9c16bb36a',
		'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
	}
};

// Declare the results list up here so the filter functions can edit it
let citiesUL = document.getElementById("city-results");

// Filters results in descending order by population
const popFilter = document.getElementById("pop-filter");
popFilter.onclick = (ev) => {
  citiesUL = document.getElementById("city-results")
  const cityElems = citiesUL.childNodes
  const newCityUL = document.createElement('ul')
  newCityUL.id = "city-results";
  if (cityElems.length == 1)
  {
    console.log("no children")
  }
  else
  {
    let idPopMap = new Map()
    cityElems.forEach((elem) => {
      const popInd = elem.textContent.indexOf("Population") + 12
      let pop = elem.textContent.substring(popInd)
      const endInd = pop.indexOf("C")
      pop = pop.substring(0, endInd)
      idPopMap.set(elem.id, pop)
    });
    idPopMap = new Map([...idPopMap.entries()].sort((a, b) => b[1] - a[1]))
    console.log(idPopMap)
    idPopMap.delete(undefined)
    for (let [key, value] of idPopMap){
      console.log(key)
      elem = document.getElementById(key)
      console.log(elem)
      newCityUL.appendChild(elem)
    }
    while (citiesUL.firstChild){
      citiesUL.removeChild(citiesUL.firstChild)
    }
    citiesUL.replaceWith(newCityUL)
  }
};

// Filters results by city alphabetically
const cityFilter = document.getElementById("city-filter");
cityFilter.onclick = (ev) => {
  citiesUL = document.getElementById("city-results")
  const cityElems = citiesUL.childNodes
  const newCityUL = document.createElement('ul')
  newCityUL.id = "city-results";
  if (cityElems.length == 1)
  {
    console.log("no children")
  }
  else
  {
    let idPopMap = new Map()
    cityElems.forEach((elem) => {
      const textList = elem.textContent.split(" ")
      const pop = textList[textList.length-1]
      idPopMap.set(elem.id, pop)
    });
    idPopMap = new Map([...idPopMap.entries()].sort())
    console.log(idPopMap)
    idPopMap.delete(undefined)
    for (let [key, value] of idPopMap){
      console.log(key)
      elem = document.getElementById(key)
      console.log(elem)
      newCityUL.appendChild(elem)
    }
    while (citiesUL.firstChild){
      citiesUL.removeChild(citiesUL.firstChild)
    }
    citiesUL.replaceWith(newCityUL)
  }
};

// Filters the results by country alphabetically
const countryFilter = document.getElementById("country-filter");
countryFilter.onclick = (ev) => {
  citiesUL = document.getElementById("city-results")
  const cityElems = citiesUL.childNodes
  const newCityUL = document.createElement('ul')
  newCityUL.id = "city-results";
  if (cityElems.length == 1)
  {
    console.log("no children")
  }
  else
  {
    let idPopMap = new Map()
    cityElems.forEach((elem) => {
      let colonInd = elem.textContent.indexOf(':')
      let parenInd = elem.textContent.indexOf('(')
      let temp = elem.textContent.substring(colonInd, parenInd)
      const country = temp.replace(/\s+/g, '');
      console.log(country)
      idPopMap.set(elem.id, country)
    });
    idPopMap = new Map([...idPopMap.entries()].sort((a, b) => String(a[1]).localeCompare(b[1])))
    console.log(idPopMap)
    idPopMap.delete(undefined)
    for (let [key, value] of idPopMap){
      console.log(key)
      elem = document.getElementById(key)
      console.log(elem)
      newCityUL.appendChild(elem)
    }
    while (citiesUL.firstChild){
      citiesUL.removeChild(citiesUL.firstChild)
    }
    citiesUL.replaceWith(newCityUL)
  }
};



const searchForm = document.getElementById("top-search");
searchForm.onsubmit = (ev) => {
  console.log("submitted top-search with", ev);
  ev.preventDefault();
  const formData = new FormData(ev.target);

  const queryText = formData.get("query");
  console.log("queryText", queryText);

  const countryPromise = getCountry(queryText);
  countryPromise.then((countryResults) => {
    console.log("Country", countryResults);

    const cityListItems = countryResults.data.map(countryInfo2DOM);

    cityListItems.forEach((cityli) => {
      citiesUL.appendChild(cityli);
    });
  });
};


// Gets the corresponding country code for the searched country if it exists,
// Fetches the top 5 most populus cities` information in the country 
const getCountry = (word) => {
  console.log("Attempting to find country", word);
  const country = word.replace(/\s+/g, '');
  console.log(country)
  const map = new Map(countryCodes);
  const Code = map.get(country);
  console.log(Code)
  url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=${Code}&minPopulation=1000&sort=-population`;
  return fetch(url, options).then((resp) => resp.json());
};

// Converts country info into a list item with the city name, country name and code, as well as the population
// Returns the list item which contains a button to initiate the weather api call
const countryInfo2DOM = (countryObj) => {
  const cityListItem = document.createElement("li");
  const cityButton = document.createElement("button");
  cityButton.classList.add('btn')
  cityButton.classList.add('btn-info')
  cityButton.id = `button ${countryObj.city}`;
  cityButton.textContent = countryObj.city + `: ` + countryObj.country + ` (${countryObj.countryCode})` + ` Population: ${countryObj.population}`;
  cityButton.onclick = getCityWeather;
  cityButton.countryinfo = countryObj;
  cityListItem.appendChild(cityButton);
  cityListItem.style.listStyleType = 'none'
  cityListItem.id = countryObj.city;
  return cityListItem;
};


// Get the weather of the selected city, uses latitude and longitude for accuracy
// Calls the weather2DOM method to create an element from the info and add it to the page
const getCityWeather = (ev) => {
  const cityInfo = ev.target.textContent.split(":");
  const city = cityInfo[0];
  const cityElement = document.getElementById(`button ${city}`);
  const lat = ev.target.countryinfo.latitude;
  const long = ev.target.countryinfo.longitude;
  console.log("attempting to get weather for", city);
  return fetch(`https://api.weatherapi.com/v1/current.json?key=bad9cf9a33804e64bb9205228232904&q=${lat},${long}&aqi=no`).then((r) =>
    r.json()
  ).then((weatherResults)=> {
    console.log(weatherResults);
    if (cityElement.childNodes.length == 1){
      const weatherElem = weather2DOM(weatherResults); 
      cityElement.appendChild(weatherElem);
    }
  })
};

const weather2DOM = (weatherObj) => {

  // make a dom element (ul)
  // add weather data to list
  // return element

  const weatherDiv = document.createElement("div");
  weatherDiv.classList.add("card");

  const weatherBody = document.createElement("div");
  weatherBody.classList.add("card-body");

  const cardText = document.createElement("ul");
  cardText.style.listStyleType = 'none'

  // Make the date and time elements more readable
  const localTime = weatherObj.location.localtime;
  let timeArr = localTime.split(" ")
  let date = timeArr[0]
  let time = timeArr[1].split(":")
  if (time[0] >= 12){
    time[1] += "PM"
  }
  else{
    time[1] += "AM"
  }


  // List of conditions to display
  const cityConditions = [
    `Current Conditions: ${weatherObj.current.condition.text}`,
    `Temperature: ${weatherObj.current.temp_f}º Fahrenheit`,
    `Date: ${date}`,
    `Local Time: ${time[0]}:${time[1]}`,
    `Humidity: ${weatherObj.current.humidity}%`,
    `Wind traveling: ${weatherObj.current.wind_dir} at ${weatherObj.current.wind_mph}MPH`
  ];

  // Add condition text to card
  cityConditions.forEach((cond) =>{
    condListItem = document.createElement("li")
    condListItem.innerText = cond;
    cardText.appendChild(condListItem)
  });

  // Add the card to the body and add the weather image, return the weather element
  weatherBody.appendChild(cardText);
  const weatherImage = document.createElement("img");
  weatherImage.classList.add("card-img-top");
  weatherImage.src = weatherObj.current.condition.icon;
  weatherImage.style.height = '50px';
  weatherImage.style.width = '50px';
  weatherBody.appendChild(weatherImage)
  weatherDiv.appendChild(weatherBody)
  return weatherDiv
  
};


// List of countries and their corresponding codes
const countryCodes = [
  ["Afghanistan",	'AF'],
  ["Albania",	'AL'],
  ["Algeria",	'DZ'],
  ["AmericanSamoa",	'AS'],
  ["Andorra",	'AD'],
  ["Angola",	'AO'],
  ["Anguilla",	'AI'],
  ["Antarctica",	'AQ'],
  ["Antigua",	'AG'],
  ["Barbuda",	'AG'],
  ["Argentina",	'AR'],
  ["Armenia",	'AM'],
  ["Aruba",	'AW'],
  ["Australia",	'AU'],
  ["Austria",	'AT'],
  ["Azerbaijan",	'AZ'],
  ["Bahamas",	'BS'],
  ["Bahrain",	'BH'],
  ["Bangladesh",	'BD'],
  ["Barbados",	'BB'],
  ["Belarus",	'BY'],
  ["Belgium",	'BE'],
  ["Belize",	'BZ'],
  ["Benin",	'BJ'],
  ["Bermuda",	'BM'],
  ["Bhutan",	'BT'],
  ["Bolivia",	'BO'],
  ["Bonaire", 'BQ'],
  ["SintEustatius", 'BQ'],
  ["Saba", 'BQ'],
  ["Bosnia",	'BA'],
  ["Herzegovina", 'BA'],
  ["Botswana",	'BW'],
  ["BouvetIsland",	'BV'],
  ["Brazil",	'BR'],
  ["BritishIndianOcean", 'I6'],
  ["BruneiDarussalam",	'BN'],
  ["Bulgaria",	'BG'],
  ["BurkinaFaso",	'BF'],
  ["Burundi",	'BI'],
  ["CaboVerde",	'CV'],
  ["Cambodia",	'KH'],
  ["Cameroon",	'CM'],
  ["Canada",	'CA'],
  ["CaymanIslands", 'KY'],
  ["CentralAfricanRepublic", 'CF'],
  ["Chad",	'TD'],
  ["Chile",	'CL'],
  ["China",	'CN'],
  ["ChristmasIsland",	'CX'],
  ["CocosIslands",	'CC'],
  ["Colombia",	'CO'],
  ["Comoros",	'KM'],
  ["Congo",	'CG'],
  ["CookIslands", 'CK'],
  ["CostaRica",	'CR'],
  ["Croatia",	'HR'],
  ["Cuba",	'CU'],
  ["Curaçao",	'CW'],
  ["Cyprus",	'CY'],
  ["Czechia",	'CZ'],
  ["Denmark",	'DK'],
  ["Djibouti",	'DJ'],
  ["Dominica",	'DM'],
  ["DominicanRepublic", 'DO'],
  ["Ecuador",	'EC'],
  ["Egypt",	'EG'],
  ["ElSalvador",	'SV'],
  ["EquatorialGuinea",	'GQ'],
  ["Eritrea",	'ER'],
  ["Estonia",	'EE'],
  ["Eswatini",	'SZ'],
  ["Ethiopia",	'ET'],
  ["FalklandIslands", 'FK'],
  ["FaroeIslands",	'FO'],
  ["Fiji",	'FJ'],
  ["Finland",	'FI'],
  ["France",	'FR'],
  ["FrenchGuiana",	'GF'],
  ["FrenchPolynesia",	'PF'],
  ["FrenchSouthernTerritories",	'TF'],
  ["Gabon",	'GA'],
  ["Gambia", 'GM'],
  ["Georgia",	'GE'],
  ["Germany",	'DE'],
  ["Ghana",	'GH'],
  ["Gibraltar",	'GI'],
  ["Greece",	'GR'],
  ["Greenland",	'GL'],
  ["Grenada",	'GD'],
  ["Guadeloupe",	'GP'],
  ["Guam",	'GU'],
  ["Guatemala",	'GT'],
  ["Guernsey",	'GG'],
  ["Guinea",	'GN'],
  ["GuineaBissau",	'GW'],
  ["Guyana",	'GY'],
  ["Haiti",	'HT'],
  ["HeardIsland",	'HM'],
  ["McDonaldIslands", 'HM'],
  ["HolySee", 'VA'],
  ["Honduras",	'HN'],
  ["HongKong",	'HK'],
  ["Hungary",	'HU'],
  ["Iceland",	'IS'],
  ["India",	'IN'],
  ["Indonesia",	'ID'],
  ["Iran", 'IR'],
  ["Iraq",	'IQ'],
  ["Ireland",	'IE'],
  ["IsleofMan",	'IM'],
  ["Israel",	'IL'],
  ["Italy",	'IT'],
  ["Jamaica",	'JM'],
  ["Japan",	'JP'],
  ["Jersey",	'JE'],
  ["Jordan",	'JO'],
  ["Kazakhstan",	'KZ'],
  ["Kenya",	'KE'],
  ["Kiribati",	'KI'],
  ["SouthKorea", 'KR'],
  ["NorthKorea", 'KP'],
  ["Kuwait",	'KW'],
  ["Kyrgyzstan",	'KG'],
  ["Latvia",	'LV'],
  ["Lebanon",	'LB'],
  ["Lesotho",	'LS'],
  ["Liberia",	'LR'],
  ["Libya",	'LY'],
  ["Liechtenstein",	'LI'],
  ["Lithuania",	'LT'],
  ["Luxembourg",	'LU'],
  ["Macao",	'MO'],
  ["Madagascar",	'MG'],
  ["Malawi",	'MW'],
  ["Malaysia",	'MY'],
  ["Maldives",	'MV'],
  ["Mali",	'ML'],
  ["Malta",	'MT'],
  ["MarshallIslands", 'MH'],
  ["Martinique",	'MQ'],
  ["Mauritania",	'MR'],
  ["Mauritius",	'MU'],
  ["Mayotte",	'YT'],
  ["Mexico",	'MX'],
  ["Micronesia", 'FM'],
  ["Moldova",	'MD'],
  ["Monaco",	'MC'],
  ["Mongolia",	'MN'],
  ["Montenegro",	'ME'],
  ["Montserrat",	'MS'],
  ["Morocco",	'MA'],
  ["Mozambique",	'MZ'],
  ["Myanmar",	'MM'],
  ["Namibia",	'NA'],
  ["Nauru",	'NR'],
  ["Nepal",	'NP'],
  ["Netherlands",	'NL'],
  ["NewCaledonia",	'NC'],
  ["NewZealand",	'NZ'],
  ["Nicaragua",	'NI'],
  ["Niger",	'NE'],
  ["Nigeria",	'NG'],
  ["Niue",	'NU'],
  ["NorfolkIsland",	'NF'],
  ["NorthernMarianaIslands",	'MP'],
  ["Norway",	'NO'],
  ["Oman",	'OM'],
  ["Pakistan",	'PK'],
  ["Palau",	'PW'],
  ["Palestine",	'PS'],
  ["Panama",	'PA'],
  ["PapuaNewGuinea",	'PG'],
  ["Paraguay",	'PY'],
  ["Peru",	'PE'],
  ["Philippines",	'PH'],
  ["Pitcairn",	'PN'],
  ["Poland",	'PL'],
  ["Portugal",	'PT'],
  ["PuertoRico",	'PR'],
  ["Qatar",	'QA'],
  ["RepublicofNorthMacedonia", 'MK'],
  ["Romania",	'RO'],
  ["Russia", 'RU'],
  ["Rwanda",	'RW'],
  ["Réunion",	'RE'],
  ["SaintBarthélemy",	'BL'],
  ["SaintHelena",	'SH'],
  ["Ascension",	'SH'],
  ["TristandaCunha",	'SH'],
  ["SaintKitts", 'KN'],
  ["Nevis",	'KN'],
  ["SaintLucia",	'LC'],
  ["SaintMartin", 'MF'],
  ["SaintPierre",	'PM'],
  ["Miquelon",	'PM'],
  ["SaintVincent",	'VC'],
  ["Grenadines",	'VC'],
  ["Samoa",	'WS'],
  ["SanMarino",	'SM'],
  ["SaoTome",	'ST'],
  ["Principe",	'ST'],
  ["SaudiArabia",	'SA'],
  ["Senegal",	'SN'],
  ["Serbia",	'RS'],
  ["Seychelles",	'SC'],
  ["SierraLeone",	'SL'],
  ["Singapore",	'SG'],
  ["SintMaarten", 'SX'],
  ["Slovakia",	'SK'],
  ["Slovenia",	'SI'],
  ["SolomonIslands",	'SB'],
  ["Somalia",	'SO'],
  ["SouthAfrica",	'ZA'],
  ["SouthGeorgia",	'GS'],
  ["SouthSandwichIslands", 'GS'],
  ["SouthSudan",	'SS'],
  ["Spain",	'ES'],
  ["SriLanka",	'LK'],
  ["Sudan", 'SD'],
  ["Suriname",	'SR'],
  ["Svalbard",	'SJ'],
  ["JanMayen", 'SJ'],
  ["Sweden",	'SE'],
  ["Switzerland",	'CH'],
  ["Syria",	'SY'],
  ["Taiwan", 'TW'],
  ["Tajikistan",	'TJ'],
  ["Tanzania",	'TZ'],
  ["Thailand",	'TH'],
  ["TimorLeste",	'TL'],
  ["Togo",	'TG'],
  ["Tokelau",	'TK'],
  ["Tonga",	'TO'],
  ["Trinidad",	'TT'],
  ["Tobago",	'TT'],
  ["Tunisia",	'TN'],
  ["Turkey",	'TR'],
  ["Turkmenistan",	'TM'],
  ["TurksandCaicos", 'TC'],
  ["Tuvalu",	'TV'],
  ["Uganda",	'UG'],
  ["Ukraine",	'UA'],
  ["UnitedArabEmirates",	'AE'],
  ["UnitedKingdom", 'GB'],
  ["GreatBritain", 'GB'],
  ["UnitedStatesMinorOutlyingIslands", 'UM'],
  ["UnitedStatesofAmerica",	'US'],
  ["Uruguay",	'UY'],
  ["Uzbekistan",	'UZ'],
  ["Vanuatu",	'VU'],
  ["Venezuela",	'VE'],
  ["Vietnam",	'VN'],
  ["BritishVirginIslands",	'VG'],
  ["VirginIslands",	'VI'],
  ["Wallis",	'WF'],
  ["Futuna",	'WF'],
  ["WesternSahara",	'EH'],
  ["Yemen",	'YE'],
  ["Zambia",	'ZM'],
  ["Zimbabwe",	'ZW'],
  ["ÅlandIslands",	'AX']
]