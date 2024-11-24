// src/services/maps.ts
import axios from 'axios';
import { Location, Restaurant, RoutePreferences } from '../types';

interface SearchOptions {
  maxStops: number | null;
  minRating: number;
}

interface RestaurantSearchResult {
  restaurants: Restaurant[];
  message?: string;
}

class MapService {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  }

  // Google Maps JavaScript API methods
  async geocodeAddress(address: string): Promise<Location> {
    const geocoder = new google.maps.Geocoder();

    try {
      const result = await geocoder.geocode({ address });
      if (result.results[0]) {
        const location = result.results[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng(),
          address: result.results[0].formatted_address,
        };
      }
      throw new Error('No results found');
    } catch (error) {
      throw new Error(`Geocoding failed: ${error}`);
    }
  }

  async getDirectionsJS(origin: Location, destination: Location): Promise<google.maps.DirectionsResult> {
    const directionsService = new google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      });
      return result;
    } catch (error) {
      throw new Error(`Directions request failed: ${error}`);
    }
  }

  // Google Maps HTTP API methods
  async getRestaurantsAlongRoute(
    routeData: google.maps.DirectionsResult, 
    origin: Location,
    options: SearchOptions
  ): Promise<RestaurantSearchResult> {
    try {
      const response = await axios.post(
        'https://places.googleapis.com/v1/places:searchText', 
        {
          "textQuery": "restaurants",
          "searchAlongRouteParameters": {
            "polyline": {
              "encodedPolyline": routeData.routes[0].overview_polyline
            }
          }
        }, 
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': '*',
          },
        }
      );
  
      /* EXAMPLE RESPONSE
        "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw",
            "id": "ChIJd-UW59l7moAR8dcmXTEkAvw",
            "types": [
                "american_restaurant",
                "breakfast_restaurant",
                "bar",
                "restaurant",
                "food",
                "point_of_interest",
                "establishment"
            ],
            "nationalPhoneNumber": "(209) 257-0800",
            "internationalPhoneNumber": "+1 209-257-0800",
            "formattedAddress": "627 CA-49, Jackson, CA 95642, USA",
            "addressComponents": [{
                    "longText": "627",
                    "shortText": "627",
                    "types": [
                        "street_number"
                    ],
                    "languageCode": "en-US"
                },
                {
                    "longText": "California 49",
                    "shortText": "CA-49",
                    "types": [
                        "route"
                    ],
                    "languageCode": "en"
                },
                {
                    "longText": "Jackson",
                    "shortText": "Jackson",
                    "types": [
                        "locality",
                        "political"
                    ],
                    "languageCode": "en"
                },
                {
                    "longText": "Amador County",
                    "shortText": "Amador County",
                    "types": [
                        "administrative_area_level_2",
                        "political"
                    ],
                    "languageCode": "en"
                },
                {
                    "longText": "California",
                    "shortText": "CA",
                    "types": [
                        "administrative_area_level_1",
                        "political"
                    ],
                    "languageCode": "en"
                },
                {
                    "longText": "United States",
                    "shortText": "US",
                    "types": [
                        "country",
                        "political"
                    ],
                    "languageCode": "en"
                },
                {
                    "longText": "95642",
                    "shortText": "95642",
                    "types": [
                        "postal_code"
                    ],
                    "languageCode": "en-US"
                },
                {
                    "longText": "2535",
                    "shortText": "2535",
                    "types": [
                        "postal_code_suffix"
                    ],
                    "languageCode": "en-US"
                }
            ],
            "plusCode": {
                "globalCode": "84CX86RM+PF",
                "compoundCode": "86RM+PF Jackson, CA, USA"
            },
            "location": {
                "latitude": 38.341774,
                "longitude": -120.76633209999999
            },
            "viewport": {
                "low": {
                    "latitude": 38.3405294197085,
                    "longitude": -120.76756223029149
                },
                "high": {
                    "latitude": 38.3432273802915,
                    "longitude": -120.76486426970851
                }
            },
            "rating": 4.4,
            "googleMapsUri": "https://maps.google.com/?cid=18159116441946085361",
            "websiteUri": "https://hhrb627.com/",
            "regularOpeningHours": {
                "openNow": true,
                "periods": [{
                        "open": {
                            "day": 0,
                            "hour": 8,
                            "minute": 0
                        },
                        "close": {
                            "day": 0,
                            "hour": 14,
                            "minute": 0
                        }
                    },
                    {
                        "open": {
                            "day": 1,
                            "hour": 8,
                            "minute": 0
                        },
                        "close": {
                            "day": 1,
                            "hour": 20,
                            "minute": 30
                        }
                    },
                    {
                        "open": {
                            "day": 2,
                            "hour": 8,
                            "minute": 0
                        },
                        "close": {
                            "day": 2,
                            "hour": 20,
                            "minute": 30
                        }
                    },
                    {
                        "open": {
                            "day": 3,
                            "hour": 8,
                            "minute": 0
                        },
                        "close": {
                            "day": 3,
                            "hour": 20,
                            "minute": 30
                        }
                    },
                    {
                        "open": {
                            "day": 4,
                            "hour": 8,
                            "minute": 0
                        },
                        "close": {
                            "day": 4,
                            "hour": 20,
                            "minute": 30
                        }
                    },
                    {
                        "open": {
                            "day": 5,
                            "hour": 8,
                            "minute": 0
                        },
                        "close": {
                            "day": 5,
                            "hour": 20,
                            "minute": 30
                        }
                    },
                    {
                        "open": {
                            "day": 6,
                            "hour": 8,
                            "minute": 0
                        },
                        "close": {
                            "day": 6,
                            "hour": 20,
                            "minute": 30
                        }
                    }
                ],
                "weekdayDescriptions": [
                    "Monday: 8:00 AM – 8:30 PM",
                    "Tuesday: 8:00 AM – 8:30 PM",
                    "Wednesday: 8:00 AM – 8:30 PM",
                    "Thursday: 8:00 AM – 8:30 PM",
                    "Friday: 8:00 AM – 8:30 PM",
                    "Saturday: 8:00 AM – 8:30 PM",
                    "Sunday: 8:00 AM – 2:00 PM"
                ],
                "nextCloseTime": "2024-11-24T04:30:00Z"
            },
            "utcOffsetMinutes": -480,
            "adrFormatAddress": "\u003cspan class=\"street-address\"\u003e627 CA-49\u003c/span\u003e, \u003cspan class=\"locality\"\u003eJackson\u003c/span\u003e, \u003cspan class=\"region\"\u003eCA\u003c/span\u003e \u003cspan class=\"postal-code\"\u003e95642-2535\u003c/span\u003e, \u003cspan class=\"country-name\"\u003eUSA\u003c/span\u003e",
            "businessStatus": "OPERATIONAL",
            "priceLevel": "PRICE_LEVEL_MODERATE",
            "userRatingCount": 997,
            "iconMaskBaseUri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
            "iconBackgroundColor": "#FF9E67",
            "displayName": {
                "text": "Highway House Restaurant",
                "languageCode": "en"
            },
            "primaryTypeDisplayName": {
                "text": "American Restaurant",
                "languageCode": "en-US"
            },
            "takeout": true,
            "delivery": false,
            "dineIn": true,
            "reservable": true,
            "servesBreakfast": true,
            "servesLunch": true,
            "servesDinner": true,
            "servesBeer": true,
            "servesWine": true,
            "servesBrunch": true,
            "servesVegetarianFood": true,
            "currentOpeningHours": {
                "openNow": true,
                "periods": [{
                        "open": {
                            "day": 0,
                            "hour": 8,
                            "minute": 0,
                            "date": {
                                "year": 2024,
                                "month": 11,
                                "day": 24
                            }
                        },
                        "close": {
                            "day": 0,
                            "hour": 14,
                            "minute": 0,
                            "date": {
                                "year": 2024,
                                "month": 11,
                                "day": 24
                            }
                        }
                    },
                    {
                        "open": {
                            "day": 1,
                            "hour": 8,
                            "minute": 0,
                            "date": {
                                "year": 2024,
                                "month": 11,
                                "day": 25
                            }
                        },
                        "close": {
                            "day": 1,
                            "hour": 20,
                            "minute": 30,
                            "date": {
                                "year": 2024,
                                "month": 11,
                                "day": 25
                            }
                        }
                    },
                    {
                        "open": {
                            "day": 2,
                            "hour": 8,
                            "minute": 0,
                            "date": {
                                "year": 2024,
                                "month": 11,
                                "day": 26
                            }
                        },
                        "close": {
                            "day": 2,
                            "hour": 20,
                            "minute": 30,
                            "date": {
                                "year": 2024,
                                "month": 11,
                                "day": 26
                            }
                        }
                    },
                    {
                        "open": {
                            "day": 3,
                            "hour": 8,
                            "minute": 0,
                            "date": {
                                "year": 2024,
                                "month": 11,
                                "day": 27
                            }
                        },
                        "close": {
                            "day": 3,
                            "hour": 20,
                            "minute": 30,
                            "date": {
                                "year": 2024,
                                "month": 11,
                                "day": 27
                            }
                        }
                    },
                    {
                        "open": {
                            "day": 4,
                            "hour": 8,
                            "minute": 0,
                            "date": {
                                "year": 2024,
                                "month": 11,
                                "day": 28
                            }
                        },
                        "close": {
                            "day": 4,
                            "hour": 20,
                            "minute": 30,
                            "date": {
                                "year": 2024,
                                "month": 11,
                                "day": 28
                            }
                        }
                    },
                    {
                        "open": {
                            "day": 5,
                            "hour": 8,
                            "minute": 0,
                            "date": {
                                "year": 2024,
                                "month": 11,
                                "day": 29
                            }
                        },
                        "close": {
                            "day": 5,
                            "hour": 20,
                            "minute": 30,
                            "date": {
                                "year": 2024,
                                "month": 11,
                                "day": 29
                            }
                        }
                    },
                    {
                        "open": {
                            "day": 6,
                            "hour": 8,
                            "minute": 0,
                            "date": {
                                "year": 2024,
                                "month": 11,
                                "day": 23
                            }
                        },
                        "close": {
                            "day": 6,
                            "hour": 20,
                            "minute": 30,
                            "date": {
                                "year": 2024,
                                "month": 11,
                                "day": 23
                            }
                        }
                    }
                ],
                "weekdayDescriptions": [
                    "Monday: 8:00 AM – 8:30 PM",
                    "Tuesday: 8:00 AM – 8:30 PM",
                    "Wednesday: 8:00 AM – 8:30 PM",
                    "Thursday: 8:00 AM – 8:30 PM",
                    "Friday: 8:00 AM – 8:30 PM",
                    "Saturday: 8:00 AM – 8:30 PM",
                    "Sunday: 8:00 AM – 2:00 PM"
                ],
                "nextCloseTime": "2024-11-24T04:30:00Z"
            },
            "primaryType": "american_restaurant",
            "shortFormattedAddress": "627 CA-49, Jackson",
            "reviews": [{
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/reviews/ChZDSUhNMG9nS0VJQ0FnSURiNzVUblp3EAE",
                    "relativePublishTimeDescription": "3 months ago",
                    "rating": 5,
                    "text": {
                        "text": "Nice place in Jackson for breakfast or lunch. Met up with some friends and sat inside.  Coffee was always full and we all enjoyed our food.  Check them out!",
                        "languageCode": "en"
                    },
                    "originalText": {
                        "text": "Nice place in Jackson for breakfast or lunch. Met up with some friends and sat inside.  Coffee was always full and we all enjoyed our food.  Check them out!",
                        "languageCode": "en"
                    },
                    "authorAttribution": {
                        "displayName": "Kris Hulsing",
                        "uri": "https://www.google.com/maps/contrib/100876180130812818300/reviews",
                        "photoUri": "https://lh3.googleusercontent.com/a-/ALV-UjUBgtZYQ0fzuz8ybjHSxhisz34PY7XbYEbTJVXQn0wk1UAXcRhFZg=s128-c0x00000000-cc-rp-mo-ba4"
                    },
                    "publishTime": "2024-08-10T20:12:01.871132Z",
                    "flagContentUri": "https://www.google.com/local/review/rap/report?postId=ChZDSUhNMG9nS0VJQ0FnSURiNzVUblp3EAE&d=17924085&t=1",
                    "googleMapsUri": "https://www.google.com/maps/reviews/data=!4m6!14m5!1m4!2m3!1sChZDSUhNMG9nS0VJQ0FnSURiNzVUblp3EAE!2m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                },
                {
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/reviews/ChZDSUhNMG9nS0VJQ0FnSUQzbTV2S2RnEAE",
                    "relativePublishTimeDescription": "in the last week",
                    "rating": 5,
                    "text": {
                        "text": "Good, Midwest cooking. Comfort food. Soup, salads, dinners, and burgers are satisfying. Our waitress was a gem.\n\nYou can order the meatloaf with catsup instead of gravy. It's not on the menu so you must ask.",
                        "languageCode": "en"
                    },
                    "originalText": {
                        "text": "Good, Midwest cooking. Comfort food. Soup, salads, dinners, and burgers are satisfying. Our waitress was a gem.\n\nYou can order the meatloaf with catsup instead of gravy. It's not on the menu so you must ask.",
                        "languageCode": "en"
                    },
                    "authorAttribution": {
                        "displayName": "tim",
                        "uri": "https://www.google.com/maps/contrib/104263895243852533637/reviews",
                        "photoUri": "https://lh3.googleusercontent.com/a/ACg8ocKVItUTv16_9CHRK8LTbucKoxlXyKde2Q5LmH0VBzmwjkMhXw=s128-c0x00000000-cc-rp-mo-ba6"
                    },
                    "publishTime": "2024-11-19T06:15:57.716760Z",
                    "flagContentUri": "https://www.google.com/local/review/rap/report?postId=ChZDSUhNMG9nS0VJQ0FnSUQzbTV2S2RnEAE&d=17924085&t=1",
                    "googleMapsUri": "https://www.google.com/maps/reviews/data=!4m6!14m5!1m4!2m3!1sChZDSUhNMG9nS0VJQ0FnSUQzbTV2S2RnEAE!2m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                },
                {
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/reviews/ChZDSUhNMG9nS0VJQ0FnSURIdHY3UUxREAE",
                    "relativePublishTimeDescription": "2 months ago",
                    "rating": 4,
                    "text": {
                        "text": "It was good food and great place to eat. My kids had a great time. Only downfall was the service was a little slow on getting refills as I had to call someone over every time. But other then that it was good.",
                        "languageCode": "en"
                    },
                    "originalText": {
                        "text": "It was good food and great place to eat. My kids had a great time. Only downfall was the service was a little slow on getting refills as I had to call someone over every time. But other then that it was good.",
                        "languageCode": "en"
                    },
                    "authorAttribution": {
                        "displayName": "Neamani Taukeiaho",
                        "uri": "https://www.google.com/maps/contrib/115751382803166924946/reviews",
                        "photoUri": "https://lh3.googleusercontent.com/a-/ALV-UjWptbR6YXnCHsX_D7mX-2hoAzyEc3ub-8-luNz3Sw7p-xkzjZJp=s128-c0x00000000-cc-rp-mo"
                    },
                    "publishTime": "2024-09-15T18:58:39.402464Z",
                    "flagContentUri": "https://www.google.com/local/review/rap/report?postId=ChZDSUhNMG9nS0VJQ0FnSURIdHY3UUxREAE&d=17924085&t=1",
                    "googleMapsUri": "https://www.google.com/maps/reviews/data=!4m6!14m5!1m4!2m3!1sChZDSUhNMG9nS0VJQ0FnSURIdHY3UUxREAE!2m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                },
                {
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/reviews/ChZDSUhNMG9nS0VJQ0FnSUN1dHNqR2F3EAE",
                    "relativePublishTimeDescription": "2 years ago",
                    "rating": 5,
                    "text": {
                        "text": "A good place to eat, if you are traveling in the Jackson area. The staff is courteous and helpful. Highway House has a bar so if you need a cocktail, they have you covered (good Margaritas). You'll get good portions for the price and very tasty and filling.",
                        "languageCode": "en"
                    },
                    "originalText": {
                        "text": "A good place to eat, if you are traveling in the Jackson area. The staff is courteous and helpful. Highway House has a bar so if you need a cocktail, they have you covered (good Margaritas). You'll get good portions for the price and very tasty and filling.",
                        "languageCode": "en"
                    },
                    "authorAttribution": {
                        "displayName": "Louie Rios",
                        "uri": "https://www.google.com/maps/contrib/103462906744317677091/reviews",
                        "photoUri": "https://lh3.googleusercontent.com/a-/ALV-UjVl6xr9dkW1CavKdeder-2j7iVII16FsPxKud0AOoHsW2E-Wowg=s128-c0x00000000-cc-rp-mo-ba4"
                    },
                    "publishTime": "2022-07-27T21:18:11.303246Z",
                    "flagContentUri": "https://www.google.com/local/review/rap/report?postId=ChZDSUhNMG9nS0VJQ0FnSUN1dHNqR2F3EAE&d=17924085&t=1",
                    "googleMapsUri": "https://www.google.com/maps/reviews/data=!4m6!14m5!1m4!2m3!1sChZDSUhNMG9nS0VJQ0FnSUN1dHNqR2F3EAE!2m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                },
                {
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/reviews/ChZDSUhNMG9nS0VJQ0FnSUN3dFBTbVFnEAE",
                    "relativePublishTimeDescription": "2 months ago",
                    "rating": 2,
                    "text": {
                        "text": "Best stop in Jackson for a quick bite!! Great food!!\nCame back 7 years later and four of the eight plates served to our group were absolute nightmares. Raw eggs not cooked and running all over, crab cake Benedict that could be smelled across the table from being spoiled, hair cooked into an omelet, found while chewing, gag, and hair cooked into pancakes and the butter cup had random other food in it. All eight of us came in expecting a great meal as I had before and reviewed but this visit was so bad. I hate leaving bad reviews unless it's really bad and it was really bad. The poor server did her best and was so embarrassed but the fault lies in the kitchen. Any one of these mistakes is bad enough but to have 4 of 8 dishes sent back uneatable is huge. Wait staff was great! Please fix the kitchen!!!",
                        "languageCode": "en"
                    },
                    "originalText": {
                        "text": "Best stop in Jackson for a quick bite!! Great food!!\nCame back 7 years later and four of the eight plates served to our group were absolute nightmares. Raw eggs not cooked and running all over, crab cake Benedict that could be smelled across the table from being spoiled, hair cooked into an omelet, found while chewing, gag, and hair cooked into pancakes and the butter cup had random other food in it. All eight of us came in expecting a great meal as I had before and reviewed but this visit was so bad. I hate leaving bad reviews unless it's really bad and it was really bad. The poor server did her best and was so embarrassed but the fault lies in the kitchen. Any one of these mistakes is bad enough but to have 4 of 8 dishes sent back uneatable is huge. Wait staff was great! Please fix the kitchen!!!",
                        "languageCode": "en"
                    },
                    "authorAttribution": {
                        "displayName": "Team Holland",
                        "uri": "https://www.google.com/maps/contrib/103210298552550328557/reviews",
                        "photoUri": "https://lh3.googleusercontent.com/a-/ALV-UjXwOjjLali8nDvhA_TVCOdD_Uhjf7arwN3fmFUwfILGq-_U1Kfy=s128-c0x00000000-cc-rp-mo-ba4"
                    },
                    "publishTime": "2024-09-09T17:17:17.070946Z",
                    "flagContentUri": "https://www.google.com/local/review/rap/report?postId=ChZDSUhNMG9nS0VJQ0FnSUN3dFBTbVFnEAE&d=17924085&t=1",
                    "googleMapsUri": "https://www.google.com/maps/reviews/data=!4m6!14m5!1m4!2m3!1sChZDSUhNMG9nS0VJQ0FnSUN3dFBTbVFnEAE!2m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                }
            ],
            "photos": [{
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/photos/AdDdOWpl_7QVVLC9WsGWbFYW95O-pFCUZ3fz1eJoNoIeIZgwUYvpKPMxnuawqYz7XE-ueaohoqjknQW7IJQT61W21F3N2bDh6woldV_HMRWjuTxdUAj0QR_qKuig479yeCSWSSGJWxBeyHn6N7IEQ_CB9JW3CThKbKvNYFBR",
                    "widthPx": 4032,
                    "heightPx": 1816,
                    "authorAttributions": [{
                        "displayName": "Jake Reed",
                        "uri": "https://maps.google.com/maps/contrib/107194667739147356212",
                        "photoUri": "https://lh3.googleusercontent.com/a/ACg8ocJ3nqN-yftZBcYGBAQP-DgvnBcslLOeqJKxxvR9cAwQoa_pcA=s100-p-k-no-mo"
                    }],
                    "flagContentUri": "https://www.google.com/local/imagery/report/?cb_client=maps_api_places.places_api&image_key=!1e10!2sAF1QipPCDajrJlDLdNv_UvHZKLDFrSchNDTJBH8RU1Jl&hl=en-US",
                    "googleMapsUri": "https://www.google.com/maps/place//data=!3m4!1e2!3m2!1sAF1QipPCDajrJlDLdNv_UvHZKLDFrSchNDTJBH8RU1Jl!2e10!4m2!3m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                },
                {
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/photos/AdDdOWr8TXIfD71I52Afo_x6KBhCxfaXPcwJCkA1SOQWO0le_R3vn4A2ou0GeyxgdSiwQbVSWZAK3-_Vq7BZLNFpXJ3fXrh6KpwUNVWGzEfMO5dMJNFbzs2gcfPsKrHNJ43F6IhS-I2i4ZdDLC7yx_rfPJHnDLe5MF_sC6XF",
                    "widthPx": 3600,
                    "heightPx": 4800,
                    "authorAttributions": [{
                        "displayName": "Michael DeTore",
                        "uri": "https://maps.google.com/maps/contrib/109040517977029613633",
                        "photoUri": "https://lh3.googleusercontent.com/a-/ALV-UjUTMo2kuMK7ABbR_U9m81kT8UwtCda9GMX98BGZ9xhxqFEjA1vz=s100-p-k-no-mo"
                    }],
                    "flagContentUri": "https://www.google.com/local/imagery/report/?cb_client=maps_api_places.places_api&image_key=!1e10!2sAF1QipOHAgi6U7buLNXW48WkLRWR4kc1gl6Dsr2-bDrm&hl=en-US",
                    "googleMapsUri": "https://www.google.com/maps/place//data=!3m4!1e2!3m2!1sAF1QipOHAgi6U7buLNXW48WkLRWR4kc1gl6Dsr2-bDrm!2e10!4m2!3m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                },
                {
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/photos/AdDdOWqES3U5VyHiP_mFNh1-Wwkq5C_WpRy14A4Tugb0ygs5TYl79oy_--cKFK9UBw3Kp0aNebIR-kaD3NZuewe9vF-4xBc2JPYJ4IJ4nbCR9E-BtJ9g5jpNWWWDNLuviw5bDEz4LAMmJURNcyfi5SL5eiQH8HWof9u3jFAc",
                    "widthPx": 4000,
                    "heightPx": 3000,
                    "authorAttributions": [{
                        "displayName": "J Smitty",
                        "uri": "https://maps.google.com/maps/contrib/117927064301594758985",
                        "photoUri": "https://lh3.googleusercontent.com/a-/ALV-UjVikhOrfa1tKLlKkk6TpC8csTjq4cQ0A7duCHb9XJwzqQEYEcQ=s100-p-k-no-mo"
                    }],
                    "flagContentUri": "https://www.google.com/local/imagery/report/?cb_client=maps_api_places.places_api&image_key=!1e10!2sAF1QipNlfvWgNQ_YDWsVPFTUr6o0jQVJ8ClCbnZU36qB&hl=en-US",
                    "googleMapsUri": "https://www.google.com/maps/place//data=!3m4!1e2!3m2!1sAF1QipNlfvWgNQ_YDWsVPFTUr6o0jQVJ8ClCbnZU36qB!2e10!4m2!3m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                },
                {
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/photos/AdDdOWrFHFFQaKWFVJMOOMyYhoPzVHB8Tyuhe5ulv22PNEEJSSjjAWhEjhqyuexWlMAsAorfqwcvV1L7yf8BdgDLZJoaR4OCEaPrCbdTMu8vgWosSL4pchpVzo-w2WIN1VroTKbdsZBYr1xpliUWhV3ikZeeaSpCqYXlh82h",
                    "widthPx": 3230,
                    "heightPx": 2452,
                    "authorAttributions": [{
                        "displayName": "Flora C",
                        "uri": "https://maps.google.com/maps/contrib/117151588064610996384",
                        "photoUri": "https://lh3.googleusercontent.com/a-/ALV-UjW08CetyKYOY7p1KbJf-sMc19JrGcRHckXal54RTYFuic2oU_Fj=s100-p-k-no-mo"
                    }],
                    "flagContentUri": "https://www.google.com/local/imagery/report/?cb_client=maps_api_places.places_api&image_key=!1e10!2sAF1QipPhW5QNhnYHkNyMlsqHIOKhmRdkbrUr9FmkP-8i&hl=en-US",
                    "googleMapsUri": "https://www.google.com/maps/place//data=!3m4!1e2!3m2!1sAF1QipPhW5QNhnYHkNyMlsqHIOKhmRdkbrUr9FmkP-8i!2e10!4m2!3m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                },
                {
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/photos/AdDdOWqysLaJcUkQWdK4G9CB-IkZsCPo6acoI2dgB4gDBplTtYuFAKPgpzaS9GCJ_kH_mjw_H38JAI_RlnUamGGlm7rSoAt8ZXyDkRwZ44zN4OTLCO9VSDNVHeqfi4bFlK5FMMMVHCrhiwINUESNAIM6ltPDeIXLonZf03jo",
                    "widthPx": 3024,
                    "heightPx": 4032,
                    "authorAttributions": [{
                        "displayName": "karlitos Markez",
                        "uri": "https://maps.google.com/maps/contrib/100460876482493639862",
                        "photoUri": "https://lh3.googleusercontent.com/a-/ALV-UjUqWtlq2av7rA6Hcjd13ljVetxZu95U2kX3pBpNxbsqBh71fiYLHQ=s100-p-k-no-mo"
                    }],
                    "flagContentUri": "https://www.google.com/local/imagery/report/?cb_client=maps_api_places.places_api&image_key=!1e10!2sAF1QipMwxNT8unp8MzA2_1aFwXrIJwYIR2UjDVZG-pFm&hl=en-US",
                    "googleMapsUri": "https://www.google.com/maps/place//data=!3m4!1e2!3m2!1sAF1QipMwxNT8unp8MzA2_1aFwXrIJwYIR2UjDVZG-pFm!2e10!4m2!3m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                },
                {
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/photos/AdDdOWpwJbAPvVZj1B8SB8gtOyhh2d1PQWqJwmbVbx0nijqt4-nsHzaYLYeF-D6OIlQmXEsS_-B9R50GoUwqCxQW-iKJikBfPYZl3zVuQ4LlBtDNwFNaUeok41hH-YQySPO6GgQIXceSk3wm9M-tDfdrci2C1M-sLklvAcSj",
                    "widthPx": 3072,
                    "heightPx": 4080,
                    "authorAttributions": [{
                        "displayName": "Mike Holgate",
                        "uri": "https://maps.google.com/maps/contrib/110384901531921426550",
                        "photoUri": "https://lh3.googleusercontent.com/a-/ALV-UjV09QvsjeZ7YjA2kClz93y7yH7326eCpKmGoy43BQ-El4BZ9s-HoQ=s100-p-k-no-mo"
                    }],
                    "flagContentUri": "https://www.google.com/local/imagery/report/?cb_client=maps_api_places.places_api&image_key=!1e10!2sAF1QipP0bVcRWlGRbqDpTVsmIf1q5Ydgxkd-OYusIp6S&hl=en-US",
                    "googleMapsUri": "https://www.google.com/maps/place//data=!3m4!1e2!3m2!1sAF1QipP0bVcRWlGRbqDpTVsmIf1q5Ydgxkd-OYusIp6S!2e10!4m2!3m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                },
                {
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/photos/AdDdOWqgYl6wPT3BVphkr05BxDAzW6IECxWKPcAVK0fe_h6cqa7uC7ZvssYdt_SwaZz7_gl42FD3Q595TpztRYAGjWAUKPJXdm8OQshoas7ZJ0zEnkRkYT2SPfaJo8uDXPOxLtkqrAnOQuP0F6skqjPcR9xRtAkqHT1U2hC-",
                    "widthPx": 3000,
                    "heightPx": 4000,
                    "authorAttributions": [{
                        "displayName": "Stacey Sun",
                        "uri": "https://maps.google.com/maps/contrib/100903946363362825624",
                        "photoUri": "https://lh3.googleusercontent.com/a-/ALV-UjV32oUIrI1NI5Zf2GQXL-c7LrcCi9GCjv-cRcGRCWQyUX0pTrgMNg=s100-p-k-no-mo"
                    }],
                    "flagContentUri": "https://www.google.com/local/imagery/report/?cb_client=maps_api_places.places_api&image_key=!1e10!2sAF1QipOjREX2i__gayTis5DPo-LUJvw98qBaFUpHui1G&hl=en-US",
                    "googleMapsUri": "https://www.google.com/maps/place//data=!3m4!1e2!3m2!1sAF1QipOjREX2i__gayTis5DPo-LUJvw98qBaFUpHui1G!2e10!4m2!3m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                },
                {
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/photos/AdDdOWpkGJPRFtwPqm44hN7izL5HnFkJWUeAaYYWwVqJ7Vhw6c8x1vr5Wj28Zw378H_bxc53zoov3UaYkXfeA5SdmSWFRN2uy0e4ucL2QP6ZCuEijAE8DQVqZq-WjxMQJK9s6Fgc5aBTdMEEwDjnwchnyYpibBDMc-WvUest",
                    "widthPx": 1512,
                    "heightPx": 2688,
                    "authorAttributions": [{
                        "displayName": "Kris Hulsing",
                        "uri": "https://maps.google.com/maps/contrib/100876180130812818300",
                        "photoUri": "https://lh3.googleusercontent.com/a-/ALV-UjUBgtZYQ0fzuz8ybjHSxhisz34PY7XbYEbTJVXQn0wk1UAXcRhFZg=s100-p-k-no-mo"
                    }],
                    "flagContentUri": "https://www.google.com/local/imagery/report/?cb_client=maps_api_places.places_api&image_key=!1e10!2sAF1QipPcT2fEcph_9LReRC4BXZ8vbTuTysJoCXCUeCkj&hl=en-US",
                    "googleMapsUri": "https://www.google.com/maps/place//data=!3m4!1e2!3m2!1sAF1QipPcT2fEcph_9LReRC4BXZ8vbTuTysJoCXCUeCkj!2e10!4m2!3m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                },
                {
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/photos/AdDdOWrev_MPP6_8lRNpr0J2Z0lwfPPwblmHRn0-2bu-yzHu46DZ2UkBwv3LHFNxkHC0LlIfDoa5ilp4zeAQYHLtA4dz_JTaoOJ0eHYBomWyXSdT5RlWxnlpdTkyftAh3j8hC-7raRQhSzbzsyUykRJ1SSiaZI6WaNMzjqfJ",
                    "widthPx": 4032,
                    "heightPx": 3024,
                    "authorAttributions": [{
                        "displayName": "Jim Logg",
                        "uri": "https://maps.google.com/maps/contrib/104471682672726314604",
                        "photoUri": "https://lh3.googleusercontent.com/a-/ALV-UjWQPoXlAA1ycYRlnUU_GOMhWhe6VzV0JFR41-w1VTVRU4ByGbnarw=s100-p-k-no-mo"
                    }],
                    "flagContentUri": "https://www.google.com/local/imagery/report/?cb_client=maps_api_places.places_api&image_key=!1e10!2sAF1QipPtZ8Iu3yS2_TQYBcz5mwTfMTHS87WMi8Sdb5uK&hl=en-US",
                    "googleMapsUri": "https://www.google.com/maps/place//data=!3m4!1e2!3m2!1sAF1QipPtZ8Iu3yS2_TQYBcz5mwTfMTHS87WMi8Sdb5uK!2e10!4m2!3m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                },
                {
                    "name": "places/ChIJd-UW59l7moAR8dcmXTEkAvw/photos/AdDdOWp9bj9tespaioQXF0uWLnpBZ7uKdvzkqZd6JZ-wCFbmNRpNHF8LnW3lKstoQPtsnqE-jqssMqtA6TGy3Dquekz5l9bFbGyLRHE7-1D7DHXS3aCCJEEUReExds4uZB84jZ29-Z6OKV0O3nhmsDuMsIw8Aw8jMLvsZIIX",
                    "widthPx": 4080,
                    "heightPx": 3072,
                    "authorAttributions": [{
                        "displayName": "Julzie Brown",
                        "uri": "https://maps.google.com/maps/contrib/118012175248702155492",
                        "photoUri": "https://lh3.googleusercontent.com/a-/ALV-UjVMb25-GADrQJX7lNWVEblCLLr356vPrwnhsqbHCrvgiK5dy3QU=s100-p-k-no-mo"
                    }],
                    "flagContentUri": "https://www.google.com/local/imagery/report/?cb_client=maps_api_places.places_api&image_key=!1e10!2sAF1QipMRw7GjbYMNWLO4W30uEeovTsOIubmVbupvA4jv&hl=en-US",
                    "googleMapsUri": "https://www.google.com/maps/place//data=!3m4!1e2!3m2!1sAF1QipMRw7GjbYMNWLO4W30uEeovTsOIubmVbupvA4jv!2e10!4m2!3m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1"
                }
            ],
            "outdoorSeating": true,
            "liveMusic": false,
            "menuForChildren": true,
            "servesCocktails": true,
            "servesDessert": true,
            "servesCoffee": true,
            "goodForChildren": true,
            "restroom": true,
            "goodForGroups": true,
            "paymentOptions": {
                "acceptsCreditCards": true,
                "acceptsDebitCards": true,
                "acceptsCashOnly": false,
                "acceptsNfc": true
            },
            "parkingOptions": {
                "freeParkingLot": true,
                "freeStreetParking": true,
                "valetParking": false
            },
            "accessibilityOptions": {
                "wheelchairAccessibleParking": true,
                "wheelchairAccessibleEntrance": true,
                "wheelchairAccessibleRestroom": true,
                "wheelchairAccessibleSeating": true
            },
            "generativeSummary": {
                "overview": {
                    "text": "Homey venue with a full bar serving American comfort eats for breakfast, lunch, and dinner.",
                    "languageCode": "en-US"
                },
                "description": {
                    "text": "Laid-back American restaurant with a bar serving all-day comfort food and quick bites with vegetarian options.\nPopular for breakfast, the menu includes chicken fried steak, fish and chips, burgers, and salads. There are also healthy choices and desserts, along with beer, wine, and cocktails.\nThe cozy setting is good for kids, and the service is fast.\nCustomers typically spend $10–20.",
                    "languageCode": "en-US"
                },
                "overviewFlagContentUri": "https://www.google.com/local/review/rap/report?postId=CiUweDgwOWE3YmQ5ZTcxNmU1Nzc6MHhmYzAyMjQzMTVkMjZkN2YxMAI&d=17924085&t=12",
                "descriptionFlagContentUri": "https://www.google.com/local/review/rap/report?postId=CiUweDgwOWE3YmQ5ZTcxNmU1Nzc6MHhmYzAyMjQzMTVkMjZkN2YxMAM&d=17924085&t=12"
            },
            "addressDescriptor": {
                "landmarks": [{
                        "name": "places/ChIJMQtA8H15moARkW8BGGO1llc",
                        "placeId": "ChIJMQtA8H15moARkW8BGGO1llc",
                        "displayName": {
                            "text": "Jackson Cinema is D'Place",
                            "languageCode": "en"
                        },
                        "types": [
                            "establishment",
                            "movie_theater",
                            "point_of_interest"
                        ],
                        "straightLineDistanceMeters": 86.56289,
                        "travelDistanceMeters": 358.6148
                    },
                    {
                        "name": "places/ChIJDXMa59l7moARUtGktOe8dvg",
                        "placeId": "ChIJDXMa59l7moARUtGktOe8dvg",
                        "displayName": {
                            "text": "Gold Trail Natural Foods",
                            "languageCode": "en"
                        },
                        "types": [
                            "establishment",
                            "food",
                            "health",
                            "point_of_interest",
                            "store"
                        ],
                        "spatialRelationship": "DOWN_THE_ROAD",
                        "straightLineDistanceMeters": 35.437237,
                        "travelDistanceMeters": 6.470804
                    },
                    {
                        "name": "places/ChIJLSMG5H15moARDBEQmhWBi94",
                        "placeId": "ChIJLSMG5H15moARDBEQmhWBi94",
                        "displayName": {
                            "text": "Holiday Inn Express & Suites Jackson, an IHG Hotel",
                            "languageCode": "en"
                        },
                        "types": [
                            "establishment",
                            "lodging",
                            "point_of_interest"
                        ],
                        "straightLineDistanceMeters": 103.143456,
                        "travelDistanceMeters": 263.7876
                    },
                    {
                        "name": "places/ChIJGzEJ5tl7moARfxJTnMTiPBM",
                        "placeId": "ChIJGzEJ5tl7moARfxJTnMTiPBM",
                        "displayName": {
                            "text": "Motherlode Laundromat",
                            "languageCode": "en"
                        },
                        "types": [
                            "establishment",
                            "laundry",
                            "point_of_interest"
                        ],
                        "spatialRelationship": "DOWN_THE_ROAD",
                        "straightLineDistanceMeters": 64.10996,
                        "travelDistanceMeters": 54.00736
                    },
                    {
                        "name": "places/ChIJJ7JP-H15moAR0wMRSAFKvm8",
                        "placeId": "ChIJJ7JP-H15moAR0wMRSAFKvm8",
                        "displayName": {
                            "text": "Jackson DMV",
                            "languageCode": "en"
                        },
                        "types": [
                            "establishment",
                            "local_government_office",
                            "point_of_interest"
                        ],
                        "straightLineDistanceMeters": 162.94756,
                        "travelDistanceMeters": 300.67737
                    }
                ],
                "areas": [{
                    "name": "places/ChIJ6RByqH15moARfw5Nb5LBjLI",
                    "placeId": "ChIJ6RByqH15moARfw5Nb5LBjLI",
                    "displayName": {
                        "text": "Gold Country Center",
                        "languageCode": "en"
                    },
                    "containment": "NEAR"
                }]
            },
            "googleMapsLinks": {
                "directionsUri": "https://www.google.com/maps/dir//''/data=!4m7!4m6!1m1!4e2!1m2!1m1!1s0x809a7bd9e716e577:0xfc0224315d26d7f1!3e0",
                "placeUri": "https://maps.google.com/?cid=18159116441946085361",
                "writeAReviewUri": "https://www.google.com/maps/place//data=!4m3!3m2!1s0x809a7bd9e716e577:0xfc0224315d26d7f1!12e1",
                "reviewsUri": "https://www.google.com/maps/place//data=!4m4!3m3!1s0x809a7bd9e716e577:0xfc0224315d26d7f1!9m1!1b1",
                "photosUri": "https://www.google.com/maps/place//data=!4m3!3m2!1s0x809a7bd9e716e577:0xfc0224315d26d7f1!10e5"
            },
            "priceRange": {
                "startPrice": {
                    "currencyCode": "USD",
                    "units": "10"
                },
                "endPrice": {
                    "currencyCode": "USD",
                    "units": "20"
                }
            }
        },
      */
      let restaurants = response.data.places.map((place: any) => ({
        id: place.place_id,
        name: place.displayName,
        location: {
          lat: place.location.latitude,
          lng: place.location.longitude,
          address: place.formattedAddress,
        },
        rating: place.rating || 0,
        priceLevel: place.priceLevel || 0,
        photos: place.photos ? place.photos : [],
        reviews: place.reviews,
        distanceFromStart: place.distanceMeters || 0
      }));
  
      // Sort restaurants by distance from start of route
      restaurants = restaurants.sort((a, b) => 
        a.distanceFromStart - b.distanceFromStart
      );
  
      // Filter by rating if specified
      if (options.minRating > 0) {
        restaurants = restaurants.filter(restaurant => 
          restaurant.rating >= options.minRating
        );
      }
  
      let message: string | undefined;
      let selectedRestaurants: typeof restaurants = [];
  
      if (options.maxStops && options.maxStops > 0) {
        const totalAvailable = restaurants.length;
        
        if (totalAvailable === 0) {
          message = "No restaurants found along your route.";
          return { restaurants: [], message };
        }
  
        if (totalAvailable < options.maxStops) {
          message = `You requested ${options.maxStops} stops, but only ${totalAvailable} restaurants were found along your route.`;
          return { restaurants, message };
        }
  
        // Get total route distance
        const totalDistance = restaurants[restaurants.length - 1].distanceFromStart;
        
        // Calculate ideal segment size
        const segmentSize = totalDistance / options.maxStops;
        
        // Create segments and select one restaurant from each
        for (let i = 0; i < options.maxStops; i++) {
          const segmentStart = i * segmentSize;
          const segmentEnd = (i + 1) * segmentSize;
          
          // Find restaurants in this segment
          const segmentRestaurants = restaurants.filter(r => 
            r.distanceFromStart >= segmentStart && 
            r.distanceFromStart < segmentEnd
          );
          
          if (segmentRestaurants.length > 0) {
            // Select the highest-rated restaurant in the segment
            const bestRestaurant = segmentRestaurants.reduce((prev, current) => 
              (current.rating > prev.rating) ? current : prev
            );
            selectedRestaurants.push(bestRestaurant);
          }
        }
  
        // If we couldn't find restaurants in some segments, fill in with remaining restaurants
        if (selectedRestaurants.length < options.maxStops) {
          const remainingNeeded = options.maxStops - selectedRestaurants.length;
          const selectedIds = new Set(selectedRestaurants.map(r => r.id));
          const remainingRestaurants = restaurants
            .filter(r => !selectedIds.has(r.id))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, remainingNeeded);
          
          selectedRestaurants = [...selectedRestaurants, ...remainingRestaurants]
            .sort((a, b) => a.distanceFromStart - b.distanceFromStart);
        }
  
        message = `Showing ${selectedRestaurants.length} restaurants distributed along your route.`;
        return {
          restaurants: selectedRestaurants,
          message
        };
      }
  
      return {
        restaurants,
        message
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch restaurants: ${errorMessage}`);
    }
  }

  async getDirectionsHTTP(origin: Location, destination: Location, preferences: RoutePreferences) {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          key: this.apiKey,
          alternatives: false,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch directions: ${error}`);
    }
  }

  async getRestaurantDetails(placeId: string) {
    try {
      const service = new google.maps.places.PlacesService(
        // We need a map instance or HTML element to create the service
        new google.maps.Map(document.createElement('div'))
      );
  
      return new Promise((resolve, reject) => {
        service.getDetails(
          {
            placeId: placeId,
            fields: ['place_id', 'name', 'formatted_address', 'rating', 'price_level', 'photos', 'reviews']
          },
          (result, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && result) {
              resolve({
                id: result.place_id,
                name: result.name,
                address: result.formatted_address,
                rating: result.rating || 0,
                priceLevel: result.price_level || 0,
                photos: result.photos 
                  ? result.photos.map(photo => photo.getUrl({ maxWidth: 400 }))
                  : [],
                reviews: result.reviews?.map(review => ({
                  author_name: review.author_name,
                  rating: review.rating,
                  text: review.text,
                  time: review.time
                })) || []
              });
            } else {
              reject(new Error(`Place details request failed: ${status}`));
            }
          }
        );
      });
    } catch (error) {
      throw new Error(`Failed to fetch restaurant details: ${error}`);
    }
  }
}

export const mapService = new MapService();