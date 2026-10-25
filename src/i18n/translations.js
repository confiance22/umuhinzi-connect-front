export const translations = {
  en: {
    nav: {
      home: 'Home',
      harvests: 'Browse Harvests',
      howItWorks: 'How It Works',
      marketPrices: 'Market Prices'
    },
    common: {
      signIn: 'Sign in',
      getStarted: 'Get Started',
      viewDetails: 'View details',
      learnMore: 'Learn more',
      browseHarvests: 'Browse harvests',
      createAccount: 'Create account',
      seePrices: 'See market prices',
      search: 'Search',
      all: 'All',
      closeMenu: 'Close menu',
      openMenu: 'Open menu',
      toggleTheme: 'Toggle theme',
      toggleLanguage: 'Switch language',
      perKg: 'per kg',
      today: 'Today',
      updated: 'Updated',
      viewAll: 'View all',
      backHome: 'Back to home'
    },
    theme: {
      light: 'Light mode',
      dark: 'Dark mode'
    },
    lang: {
      en: 'ENG',
      rw: 'RWA',
      enName: 'English',
      rwName: 'Ikinyarwanda'
    },
    landing: {
      hero: {
        headlinePrefix: 'Good food starts with a',
        headlineAccent: 'fair deal.',
        description:
          'Umuhinzi Connect puts Rwanda’s harvests in front of real buyers — without the layers that eat the margin.',
        directTrade: 'Direct trade',
        noMiddlemen: 'No middlemen',
        market: 'Market',
        today: 'Today',
        note: 'Farm-gate note / 25 Oct',
        basketAverage: 'Basket average',
        upFromLastSeason: 'Up 12% from last season',
        source: 'Source: Umuhinzi market desk',
        allPrices: 'All prices',
        cropIndex: 'Crop index',
        cropList: 'Potatoes · Maize · Beans · Tomatoes · Avocado · Rice',
        viewAllPrices: 'View all prices',
        unit: '/kg',
        stats: {
          farmers: 'Verified farmers',
          districts: 'Districts covered',
          layers: 'Middle layers'
        },
        marketRows: [
          { crop: 'Irish potatoes', region: 'Musanze', price: 'RWF 320', change: '+4.2%', up: true },
          { crop: 'Tomatoes', region: 'Kigali', price: 'RWF 650', change: '+2.8%', up: true },
          { crop: 'Maize', region: 'Nyagatare', price: 'RWF 410', change: '-1.1%', up: false }
        ]
      },
      features: {
        title: 'Why Umuhinzi',
        heading: 'A better way to trade fresh produce',
        description:
          'One marketplace for discovery, fair pricing and direct relationships across Rwanda’s agricultural food chain.',
        items: [
          {
            title: 'Direct from farmers',
            desc: 'Source fresh produce straight from the people who grow it, without unnecessary middlemen.'
          },
          {
            title: 'Transparent prices',
            desc: 'See daily market prices before you buy or sell so every decision starts from clarity.'
          },
          {
            title: 'Nationwide reach',
            desc: 'Connect with farmers and buyers across Rwanda, from the hills to the city markets.'
          },
          {
            title: 'Trusted trade',
            desc: 'Verified profiles and clear harvest details help both sides trade with confidence.'
          }
        ]
      },
      categories: {
        title: 'Marketplace',
        heading: 'Browse by category',
        description: 'Find the produce you need, or list the harvest you are ready to sell.',
        explore: 'Explore',
        items: [
          {
            label: 'Vegetables',
            detail: 'Leafy greens, tomatoes, onions and more'
          },
          {
            label: 'Fruits',
            detail: 'Avocado, bananas, citrus and seasonal fruit'
          },
          {
            label: 'Grains',
            detail: 'Maize, rice and other staple grains'
          },
          {
            label: 'Legumes',
            detail: 'Beans, peas and protein-rich pulses'
          }
        ]
      },
      harvestPreview: {
        title: 'Fresh from the farm',
        heading: 'Harvests ready for the market',
        description:
          'A preview of the produce farmers are listing right now. Browse everything on the marketplace.',
        available: 'Available',
        viewAll: 'View all harvests',
        items: [
          {
            crop: 'Maize',
            variety: 'Yellow maize',
            farmer: 'Jean Bosco',
            district: 'Nyagatare',
            price: '450',
            quantity: '1.2 t available'
          },
          {
            crop: 'Beans',
            variety: 'Red kidney beans',
            farmer: 'Alice Mukamana',
            district: 'Musanze',
            price: '780',
            quantity: '800 kg available'
          },
          {
            crop: 'Irish potatoes',
            variety: 'Kinigi variety',
            farmer: 'Eric Nsengimana',
            district: 'Musanze',
            price: '320',
            quantity: '2 t available'
          },
          {
            crop: 'Avocado',
            variety: 'Hass avocado',
            farmer: 'Patrick Niyonsaba',
            district: 'Kayanza',
            price: '850',
            quantity: '600 kg available'
          }
        ]
      },
      story: {
        mission: 'Our mission',
        heading: 'Built around the way Rwanda already trades.',
        description:
          'Farming is personal. Trade should feel the same. Umuhinzi Connect brings the marketplace into one clear space so farmers can reach more buyers and buyers can source with confidence.',
        points: [
          'A shared marketplace for farmers and buyers',
          'Clear prices that make every trade easier to plan',
          'Direct relationships that strengthen local food systems'
        ],
        snapshot: 'Market snapshot',
        snapshotTitle: 'Today’s indicative prices',
        daily: 'Daily',
        explorePrices: 'Explore market prices',
        prices: [
          { crop: 'Maize', district: 'Nyagatare', price: '450', change: '+2.4%', up: true },
          { crop: 'Beans', district: 'Musanze', price: '780', change: '+1.1%', up: true },
          { crop: 'Potatoes', district: 'Huye', price: '320', change: '-0.8%', up: false }
        ]
      },
      trustBar: {
        label: 'Built for the food chain',
        audiences: [
          'Smallholder farmers',
          'Farmer cooperatives',
          'Fresh produce buyers',
          'Restaurants & hotels',
          'Local markets',
          'Agri-traders',
          'Institutional kitchens'
        ]
      },
      cta: {
        eyebrow: 'Grow with Umuhinzi Connect',
        heading: 'Your harvest deserves a wider market.',
        description:
          'List what you grow, reach buyers across Rwanda and trade with prices you can trust.'
      }
    },
    harvests: {
      badge: 'Fresh from the farm',
      title: 'Browse harvests from Rwandan farmers',
      subtitle:
        'Discover fresh produce, compare prices and connect directly with the people who grow your food.',
      stats: {
        farmers: 'Verified farmers',
        districts: 'Districts covered',
        crops: 'Crop varieties'
      },
      searchPlaceholder: 'Search crops, farmers or districts...',
      categories: {
        all: 'All',
        vegetables: 'Vegetables',
        fruits: 'Fruits',
        grains: 'Grains',
        legumes: 'Legumes'
      },
      crops: {
        maize: 'Maize',
        beans: 'Beans',
        potatoes: 'Irish potatoes',
        tomatoes: 'Tomatoes',
        rice: 'Rice',
        cassava: 'Cassava',
        onions: 'Onions',
        avocado: 'Avocado',
        bananas: 'Bananas',
        oranges: 'Oranges',
        cabbage: 'Cabbage',
        carrots: 'Carrots'
      },
      available: 'Available',
      from: 'From',
      viewHarvest: 'View harvest',
      noResults: 'No harvests found',
      noResultsHint: 'Try a different search or choose another category.',
      ctaTitle: 'Have a harvest ready to sell?',
      ctaSubtitle: 'Create your free account today and reach buyers across Rwanda.',
      ctaButton: 'Start selling'
    },
    how: {
      badge: 'Simple by design',
      title: 'How Umuhinzi Connect works',
      subtitle:
        'A clear path from the farm to the market, built for farmers and buyers who value fresh produce and fair prices.',
      farmers: {
        label: 'For farmers',
        title: 'Sell your harvest with confidence',
        description:
          'List what you grow, set your price and connect with buyers who are ready to purchase.',
        steps: [
          {
            title: 'Create your account',
            desc: 'Register as a farmer using your phone number or email address.'
          },
          {
            title: 'List your harvest',
            desc: 'Add photos, quantity, location and the price you want for your produce.'
          },
          {
            title: 'Receive buyer interest',
            desc: 'See buyers looking for your crops and confirm the orders that work for you.'
          },
          {
            title: 'Deliver and get paid',
            desc: 'Coordinate delivery, complete the sale and receive payment securely.'
          }
        ]
      },
      buyers: {
        label: 'For buyers',
        title: 'Source fresh produce with ease',
        description:
          'Search by crop or district, compare daily prices and buy directly from trusted farmers.',
        steps: [
          {
            title: 'Explore the marketplace',
            desc: 'Browse harvests by crop, district, quantity or price range.'
          },
          {
            title: 'Compare market prices',
            desc: 'Check daily price trends before you make a purchasing decision.'
          },
          {
            title: 'Place your order',
            desc: 'Select the produce you need, confirm quantities and send your request.'
          },
          {
            title: 'Track your delivery',
            desc: 'Follow your order from the farm all the way to your business.'
          }
        ]
      },
      trustTitle: 'Built for trust and simplicity',
      trustSubtitle:
        'No middlemen, no guesswork. Just transparent prices and direct connections.',
      trustPoints: [
        {
          title: 'Direct connections',
          desc: 'Buy and sell directly, without unnecessary middlemen.'
        },
        {
          title: 'Transparent prices',
          desc: 'Daily market prices help you make informed decisions.'
        },
        {
          title: 'Nationwide reach',
          desc: 'Connect with farmers and buyers across Rwanda.'
        }
      ],
      ctaTitle: 'Ready to get started?',
      ctaSubtitle: 'Create your account today and join Rwanda’s growing agricultural marketplace.',
      ctaButton: 'Create free account'
    },
    prices: {
      badge: 'Market intelligence',
      title: 'Daily market prices',
      subtitle:
        'Track indicative prices for staple crops across key markets in Rwanda, updated every day.',
      updated: 'Updated today',
      searchPlaceholder: 'Search crops or markets...',
      district: 'District',
      allDistricts: 'All districts',
      crop: 'Crop',
      market: 'Market',
      unit: 'Unit',
      priceToday: 'Price today',
      change: 'Change',
      average: 'Average price',
      gainers: 'Top gainers',
      losers: 'Top decliners',
      noResults: 'No prices found',
      note: 'Prices are indicative and may change. Confirm with the farmer before purchasing.',
      ctaTitle: 'Ready to buy at today’s prices?',
      ctaSubtitle: 'Browse fresh harvests and connect directly with farmers.',
      ctaButton: 'Browse harvests'
    },
    footer: {
      tagline:
        'Connecting Rwandan farmers and buyers from the farm to the market, with fair prices and fresh produce.',
      platform: 'Platform',
      account: 'Account',
      copyright: 'Umuhinzi Connect. All rights reserved.',
      madeIn: 'Built in Rwanda'
    }
  },
  rw: {
    nav: {
      home: 'Ahabanza',
      harvests: 'Reba Umusaruro',
      howItWorks: 'Uko Bikorwa',
      marketPrices: 'Ibiciro ku Isoko'
    },
    common: {
      signIn: 'Injira',
      getStarted: 'Tangira',
      viewDetails: 'Reba birambuye',
      learnMore: 'Menya byinshi',
      browseHarvests: 'Reba umusaruro',
      createAccount: 'Fungura konti',
      seePrices: 'Reba ibiciro',
      search: 'Shakisha',
      all: 'Byose',
      closeMenu: 'Funga menu',
      openMenu: 'Fungura menu',
      toggleTheme: 'Hindura insanganyamatsiko',
      toggleLanguage: 'Hindura ururimi',
      perKg: 'kuri kg',
      today: 'Uyu munsi',
      updated: 'Byavuguruwe',
      viewAll: 'Reba byose',
      backHome: 'Subira ahabanza'
    },
    theme: {
      light: 'Umucyo',
      dark: 'Umwijima'
    },
    lang: {
      en: 'ENG',
      rw: 'RWA',
      enName: 'English',
      rwName: 'Ikinyarwanda'
    },
    landing: {
      hero: {
        headlinePrefix: 'Ibiryo byiza bitangira ku',
        headlineAccent: 'gucuruza kuringana.',
        description:
          'Umuhinzi Connect ishyira umusaruro w’u Rwanda imbere y’abaguzi nyabo — nta bayobora hagati barya inyungu.',
        directTrade: 'Ubucuruzi butaziguye',
        noMiddlemen: 'Nta bayobora hagati',
        market: 'Isoko',
        today: 'Uyu munsi',
        note: 'Ibiciro ku murima / 25 Ukwakira',
        basketAverage: 'Impuzandengo y’ibicuruzwa',
        upFromLastSeason: 'Byazamutse 12% ugereranyije n’igihembwe gishize',
        source: 'Inkomoko: Ibiro by’isoko bya Umuhinzi',
        allPrices: 'Ibiciro byose',
        cropIndex: 'Urutonde rw’imyaka',
        cropList: 'Ibirayi · Ibigori · Ibishyimbo · Inyanya · Avoka · Umuceri',
        viewAllPrices: 'Reba ibiciro byose',
        unit: '/kg',
        stats: {
          farmers: 'Abahinzi bemejwe',
          districts: 'Uturere dufatwamo',
          layers: 'Abayobora hagati'
        },
        marketRows: [
          { crop: 'Ibirayi', region: 'Musanze', price: 'RWF 320', change: '+4.2%', up: true },
          { crop: 'Inyanya', region: 'Kigali', price: 'RWF 650', change: '+2.8%', up: true },
          { crop: 'Ibigori', region: 'Nyagatare', price: 'RWF 410', change: '-1.1%', up: false }
        ]
      },
      features: {
        title: 'Kuki Umuhinzi',
        heading: 'Uburyo bwiza bwo gucuruza umusaruro mushya',
        description:
          'Isoko rimwe ryo kuvumbura, ibiciro byiza n’isano itaziguye mu rwego rw’ubuhinzi bw’u Rwanda.',
        items: [
          {
            title: 'Uva ku bahinzi',
            desc: 'Gura umusaruro mushya uhereye ku babuhinze, nta bayobora hagati badafite akamaro.'
          },
          {
            title: 'Ibiciro bisobanutse',
            desc: 'Reba ibiciro by’isoko buri munsi mbere yo kugura cyangwa kugurisha, kugira ngo icyemezo cyose gitangire mu mucyo.'
          },
          {
            title: 'Ugere mu gihugu hose',
            desc: 'Huza n’abahinzi n’abaguzi mu Rwanda hose, uhereye ku misozi kugera ku masoko y’umujyi.'
          },
          {
            title: 'Ubucuruzi bwizewe',
            desc: 'Umwirondoro wemejwe n’amakuru asobanutse y’umusaruro bifasha impande zombi gucuruza bizeruye.'
          }
        ]
      },
      categories: {
        title: 'Isoko',
        heading: 'Reba ukurikije icyiciro',
        description: 'Shakisha umusaruro ukeneye, cyangwa shyira ku isoko umusaruro witeguye kugurisha.',
        explore: 'Reba',
        items: [
          {
            label: 'Imboga',
            detail: 'Imboga z’amatabi, inyanya, ibitunguru n’ibindi'
          },
          {
            label: 'Imbuto',
            detail: 'Avoka, imineke, amacunga n’imbuto z’igihe'
          },
          {
            label: 'Ibinyampeke',
            detail: 'Ibigori, umuceri n’ibindi binyampeke by’ibanze'
          },
          {
            label: 'Ibinyamisogwe',
            detail: 'Ibishyimbo, amashaza n’ibinyamisogwe birimo poroteyine'
          }
        ]
      },
      harvestPreview: {
        title: 'Umusaruro mushya',
        heading: 'Umusaruro witeguye ku isoko',
        description:
          'Incamake y’umusaruro abahinzi bashyira ku isoko ubu. Reba byose ku isoko.',
        available: 'Bihari',
        viewAll: 'Reba umusaruro wose',
        items: [
          {
            crop: 'Ibigori',
            variety: 'Ibigori by’umuhondo',
            farmer: 'Jean Bosco',
            district: 'Nyagatare',
            price: '450',
            quantity: 'Toni 1.2 zihari'
          },
          {
            crop: 'Ibishyimbo',
            variety: 'Ibishyimbo bitukura',
            farmer: 'Alice Mukamana',
            district: 'Musanze',
            price: '780',
            quantity: 'kg 800 zihari'
          },
          {
            crop: 'Ibirayi',
            variety: 'Ubwoko bwa Kinigi',
            farmer: 'Eric Nsengimana',
            district: 'Musanze',
            price: '320',
            quantity: 'Toni 2 zihari'
          },
          {
            crop: 'Avoka',
            variety: 'Avoka ya Hass',
            farmer: 'Patrick Niyonsaba',
            district: 'Kayanza',
            price: '850',
            quantity: 'kg 600 zihari'
          }
        ]
      },
      story: {
        mission: 'Intego yacu',
        heading: 'Twubakiye ku buryo u Rwanda rusanzwe gucuruza.',
        description:
          'Ubuhinzi ni ubuzima bwite. Ubucuruzi bugombye kumera gutyo. Umuhinzi Connect ishyira isoko ahantu hamwe hasobanutse kugira ngo abahinzi bagere ku baguzi benshi n’abaguzi bagure bizeruye.',
        points: [
          'Isoko rusange ry’abahinzi n’abaguzi',
          'Ibiciro bisobanutse byoroshya gutegura ubucuruzi bwose',
          'Isano itaziguye ikomeza uburyo bw’ibiribwa mu karere'
        ],
        snapshot: 'Incamake y’isoko',
        snapshotTitle: 'Ibiciro by’uyu munsi',
        daily: 'Buri munsi',
        explorePrices: 'Reba ibiciro by’isoko',
        prices: [
          { crop: 'Ibigori', district: 'Nyagatare', price: '450', change: '+2.4%', up: true },
          { crop: 'Ibishyimbo', district: 'Musanze', price: '780', change: '+1.1%', up: true },
          { crop: 'Ibirayi', district: 'Huye', price: '320', change: '-0.8%', up: false }
        ]
      },
      trustBar: {
        label: 'Yakorewe uruhererekane rw’ibiribwa',
        audiences: [
          'Abahinzi bato',
          'Amakoperative y’abahinzi',
          'Abaguzi b’umusaruro mushya',
          'Resitora na hoteli',
          'Amasoko yo mu karere',
          'Abacuruzi b’ubuhinzi',
          'Ibigo byo gukoreramo ibiryo'
        ]
      },
      cta: {
        eyebrow: 'Kura hamwe na Umuhinzi Connect',
        heading: 'Umusaruro wawe ukwiye isoko rinini.',
        description:
          'Shyira ku isoko ibyo uhinga, gere ku baguzi mu Rwanda hose kandi ucuruze ku biciro wizera.'
      }
    },
    harvests: {
      badge: 'Umusaruro mushya',
      title: 'Reba umusaruro uheruka ku isoko',
      subtitle:
        'Huza n’abahinzi b’abanyarwanda, gereranya ibiciro kandi ugure umusaruro mushya mu buryo bworoshye.',
      stats: {
        farmers: 'Abahinzi bemejwe',
        districts: 'Uturere dufatwamo',
        crops: 'Ubwoko bw’imyaka'
      },
      searchPlaceholder: 'Shakisha imyaka, umuhinzi cyangwa akarere...',
      categories: {
        all: 'Byose',
        vegetables: 'Imboga',
        fruits: 'Imbuto',
        grains: 'Ibinyampeke',
        legumes: 'Ibinyamisogwe'
      },
      crops: {
        maize: 'Ibigori',
        beans: 'Ibishyimbo',
        potatoes: 'Ibirayi',
        tomatoes: 'Inyanya',
        rice: 'Umuceri',
        cassava: 'Imyumbati',
        onions: 'Ibitunguru',
        avocado: 'Avoka',
        bananas: 'Imineke',
        oranges: 'Amacunga',
        cabbage: 'Amashu',
        carrots: 'Karoti'
      },
      available: 'Bihari',
      from: 'Kuva kuri',
      viewHarvest: 'Reba umusaruro',
      noResults: 'Nta musaruro wabonetse',
      noResultsHint: 'Gerageza andi magambo cyangwa uhitemo ikindi cyiciro.',
      ctaTitle: 'Ufite umusaruro witeguye kugurisha?',
      ctaSubtitle: 'Fungura konti yawe uyu munsi kandi ugere ku baguzi benshi mu Rwanda.',
      ctaButton: 'Tangira kugurisha'
    },
    how: {
      badge: 'Byoroshye',
      title: 'Uko Umuhinzi Connect ikorwa',
      subtitle:
        'Uburyo bworoshye bwo guhuza abahinzi n’abaguzi, uhereye ku musaruro kugera ku isoko.',
      farmers: {
        label: 'Abahinzi',
        title: 'Gurisha umusaruro wawe mu buryo bworoshye',
        description:
          'Shyira umusaruro wawe ku isoko, menya ibiciro kandi ugurishe abaguzi b’abanyarwanda.',
        steps: [
          {
            title: 'Fungura konti yawe',
            desc: 'Iyandikishe nk’umuhinzi ukoresheje telefoni cyangwa imeyili.'
          },
          {
            title: 'Shyira umusaruro ku isoko',
            desc: 'Ongeraho amafoto, ingano, aho uherereye n’igiciro ushaka.'
          },
          {
            title: 'Akira ibyifuzo by’abaguzi',
            desc: 'Reba abaguzi bashaka umusaruro wawe kandi wemeze ibicuruzwa.'
          },
          {
            title: 'Tanga kandi wishyure',
            desc: 'Huza n’umuguzi, tuma ibicuruzwa kandi wishyure mu buryo bwizewe.'
          }
        ]
      },
      buyers: {
        label: 'Abaguzi',
        title: 'Gura umusaruro mushya ku giciro cyiza',
        description:
          'Shakisha umusaruro, gereranya ibiciro by’amasoko kandi ugure ku bahinzi bizewe.',
        steps: [
          {
            title: 'Shakisha umusaruro',
            desc: 'Reba umusaruro ushingiye ku bwoko, akarere, ingano cyangwa igiciro.'
          },
          {
            title: 'Gereranya ibiciro',
            desc: 'Reba ibiciro by’amasoko ku munsi mbere yo gufata icyemezo.'
          },
          {
            title: 'Tumiza ibicuruzwa',
            desc: 'Hitamo umusaruro, wemeze ingano kandi utange ibwiriza.'
          },
          {
            title: 'Kurikirana itangwa',
            desc: 'Kurikirana ibicuruzwa uhereye ku murima kugera aho bigeze.'
          }
        ]
      },
      trustTitle: 'Yubakiwe ubwizerwe n’ubworoherane',
      trustSubtitle:
        'Nta bayobora hagati, nta gukeka. Ibiciro bisobanutse n’isano itaziguye.',
      trustPoints: [
        {
          title: 'Isano itaziguye',
          desc: 'Gura kandi ugurishe mu buryo butaziguye, nta bayobora hagati.'
        },
        {
          title: 'Ibiciro bisobanutse',
          desc: 'Ibiciro by’amasoko ku munsi bifasha gufata ibyemezo byiza.'
        },
        {
          title: 'Ugere mu Rwanda hose',
          desc: 'Huza n’abahinzi n’abaguzi mu turere twose tw’u Rwanda.'
        }
      ],
      ctaTitle: 'Witeguye gutangira?',
      ctaSubtitle:
        'Fungura konti yawe uyu munsi kandi ube umwe mu bahinzi n’abaguzi ba mbere.',
      ctaButton: 'Fungura konti'
    },
    prices: {
      badge: 'Amakuru y’isoko',
      title: 'Ibiciro by’amasoko ku munsi',
      subtitle:
        'Reba ibiciro by’umusaruro rusange mu masoko y’ibanze mu Rwanda, bivugururwa buri munsi.',
      updated: 'Byavuguruwe uyu munsi',
      searchPlaceholder: 'Shakisha umusaruro cyangwa isoko...',
      district: 'Akarere',
      allDistricts: 'Uturere twose',
      crop: 'Umusaruro',
      market: 'Isoko',
      unit: 'Igipimo',
      priceToday: 'Igiciro uyu munsi',
      change: 'Impinduka',
      average: 'Igiciro kigereranyije',
      gainers: 'Byazamutse cyane',
      losers: 'Byagabanutse cyane',
      noResults: 'Nta biciro byabonetse',
      note: 'Ibiciro ni iby’urugero gusa kandi bishobora guhinduka. Vugana n’umuhinzi mbere yo kugura.',
      ctaTitle: 'Witeguye kugura ku biciro by’uyu munsi?',
      ctaSubtitle: 'Reba umusaruro mushya kandi uhuze n’abahinzi.',
      ctaButton: 'Reba umusaruro'
    },
    footer: {
      tagline:
        'Guhuza abahinzi n’abaguzi mu Rwanda, uhereye ku murima kugera ku isoko, ku biciro byiza n’umusaruro mushya.',
      platform: 'Urubuga',
      account: 'Konti',
      copyright: 'Umuhinzi Connect. Uburenganzira bwose burafitwe.',
      madeIn: 'Yubakiwe mu Rwanda'
    }
  }
}
