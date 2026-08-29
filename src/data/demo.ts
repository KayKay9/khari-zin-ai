import type { Attraction, Bus, ChatPayload, Hotel } from "@/lib/types";

type DemoCity = {
  attractions: Attraction[];
  hotels: Hotel[];
  buses: Bus[];
};

const yangon: DemoCity = {
  attractions: [
    {
      id: "demo-shwedagon",
      name: { en: "Shwedagon Pagoda", my: "ရွှေတိဂုံစေတီတော်" },
      city: "Yangon",
      category: "pagoda",
      durationHours: 2,
      tips: {
        en: "Go at sunset. Shoes off at the platform.",
        my: "နေဝင်ချိန်သွားပါ။ ပလ္လင်ပေါ်မှာ ဖိနပ်ချွတ်ရပါမယ်။",
      },
      lat: 16.7984,
      lng: 96.1496,
      day: 1,
    },
    {
      id: "demo-sule",
      name: { en: "Sule Pagoda", my: "ဆူးလေစေတီ" },
      city: "Yangon",
      category: "pagoda",
      durationHours: 1,
      tips: {
        en: "Center of downtown; easy with tea shops nearby.",
        my: "မြို့လယ်ခေါင်။ ပတ်ဝန်းကျင်မှာ လက်ဖက်ရည်ဆိုင်များ။",
      },
      lat: 16.7742,
      lng: 96.1586,
      day: 1,
    },
    {
      id: "demo-kandawgyi",
      name: { en: "Kandawgyi Lake", my: "ကန်တော်ကြီး" },
      city: "Yangon",
      category: "nature",
      durationHours: 1.5,
      tips: {
        en: "Walk the boardwalk; Karaweik is on the east side.",
        my: "လမ်းလျှောက်ကောင်းပါတယ်။ ကရဝိက်က အရှေ့ဘက်။",
      },
      lat: 16.795,
      lng: 96.165,
      day: 2,
    },
  ],
  hotels: [
    {
      id: "demo-hotel-ygn-1",
      name: { en: "Garden Guest House", my: "ဂါးဒင်း ဧည့်ရိပ်သာ" },
      city: "Yangon",
      area: { en: "Dagon", my: "ဒဂုံ" },
      priceMmkMin: 45000,
      priceMmkMax: 75000,
      phone: "09-250123456",
      notes: {
        en: "Quiet, walking distance to Shwedagon.",
        my: "တိတ်ဆိတ်ပြီး ရွှေတိဂုံနဲ့ နီးပါတယ်။",
      },
      lat: 16.8012,
      lng: 96.152,
    },
    {
      id: "demo-hotel-ygn-2",
      name: { en: "Downtown Inn", my: "ဒေါင်းတောင်း အင်း" },
      city: "Yangon",
      area: { en: "Pabedan", my: "ပန်းဘဲတန်း" },
      priceMmkMin: 35000,
      priceMmkMax: 55000,
      phone: "01-1234567",
      notes: {
        en: "Budget stay near Sule and buses.",
        my: "ဆူးလေနဲ့ ဘတ်စ်ဂိတ်နား ဈေးသက်သာ။",
      },
      lat: 16.776,
      lng: 96.16,
    },
  ],
  buses: [
    {
      id: "demo-bus-ygn-mdy",
      from: { en: "Yangon", my: "ရန်ကုန်" },
      to: { en: "Mandalay", my: "မန္တလေး" },
      operator: "JJ Express",
      durationHours: 9,
      fareMmk: 35000,
      departWindow: { en: "Evening 17:00–21:00", my: "ညနေ ၁၇:၀၀–၂၁:၀၀" },
      notes: {
        en: "VIP night bus; book a day ahead.",
        my: "VIP ညဘတ်စ်။ တစ်ရက်ကြိုတင်မှာပါ။",
      },
    },
    {
      id: "demo-bus-ygn-bgn",
      from: { en: "Yangon", my: "ရန်ကုန်" },
      to: { en: "Bagan (Nyaung-U)", my: "ပုဂံ (ညောင်ဦး)" },
      operator: "Elite",
      durationHours: 10,
      fareMmk: 38000,
      departWindow: { en: "Night 18:00–20:00", my: "ည ၁၈:၀၀–၂၀:၀၀" },
    },
  ],
};

const mandalay: DemoCity = {
  attractions: [
    {
      id: "demo-palace",
      name: { en: "Mandalay Palace", my: "မန္တလေးနန်းတော်" },
      city: "Mandalay",
      category: "heritage",
      durationHours: 2,
      tips: {
        en: "Rent a bike; the moat walk is cooler in the morning.",
        my: "စက်ဘီးငှားပါ။ မနက်ပိုင်း ကန်သင်းလမ်း အေးပါတယ်။",
      },
      lat: 21.9927,
      lng: 96.0956,
      day: 1,
    },
    {
      id: "demo-ubein",
      name: { en: "U Bein Bridge", my: "ဦးပိန်တံတား" },
      city: "Mandalay",
      category: "heritage",
      durationHours: 1.5,
      tips: {
        en: "Sunset is crowded; go 45 minutes early.",
        my: "နေဝင်ချိန် လူများပါတယ်။ ၄၅ မိနစ်စောပြီးသွားပါ။",
      },
      lat: 21.8918,
      lng: 96.0586,
      day: 1,
    },
    {
      id: "demo-mahamuni",
      name: { en: "Mahamuni Pagoda", my: "မဟာမုနိဘုရားကြီး" },
      city: "Mandalay",
      category: "pagoda",
      durationHours: 1,
      tips: {
        en: "Men may apply gold leaf on the image.",
        my: "ကျားများ ရွှေချနိုင်ပါတယ်။",
      },
      lat: 21.951,
      lng: 96.078,
      day: 2,
    },
  ],
  hotels: [
    {
      id: "demo-hotel-mdy-1",
      name: { en: "Palace View Lodge", my: "နန်းမြင် လော့ချ်" },
      city: "Mandalay",
      area: { en: "Aungmyaythazan", my: "အောင်မြေသာဇံ" },
      priceMmkMin: 40000,
      priceMmkMax: 70000,
      phone: "02-406789",
      notes: {
        en: "Near the moat; family rooms.",
        my: "ကန်သင်းနား။ မိသားစုခန်းရှိ။",
      },
      lat: 21.985,
      lng: 96.09,
    },
    {
      id: "demo-hotel-mdy-2",
      name: { en: "Amarapura Inn", my: "အမရပူရ အင်း" },
      city: "Mandalay",
      area: { en: "Amarapura", my: "အမရပူရ" },
      priceMmkMin: 30000,
      priceMmkMax: 50000,
      phone: "09-401112233",
      notes: {
        en: "Close to U Bein; simple breakfast.",
        my: "ဦးပိန်နဲ့နီး။ မနက်စာရိုးရိုး။",
      },
      lat: 21.894,
      lng: 96.055,
    },
  ],
  buses: [
    {
      id: "demo-bus-mdy-bgn",
      from: { en: "Mandalay", my: "မန္တလေး" },
      to: { en: "Bagan", my: "ပုဂံ" },
      operator: "Mandalar Minn",
      durationHours: 5,
      fareMmk: 18000,
      departWindow: { en: "Morning 07:00–09:00", my: "မနက် ၀၇:၀၀–၀၉:၀၀" },
    },
    {
      id: "demo-bus-mdy-ygn",
      from: { en: "Mandalay", my: "မန္တလေး" },
      to: { en: "Yangon", my: "ရန်ကုန်" },
      operator: "JJ Express",
      durationHours: 9,
      fareMmk: 35000,
      departWindow: { en: "Night 18:00–21:00", my: "ည ၁၈:၀၀–၂၁:၀၀" },
    },
  ],
};

const bagan: DemoCity = {
  attractions: [
    {
      id: "demo-ananda",
      name: { en: "Ananda Temple", my: "အာနန္ဒာဘုရား" },
      city: "Bagan",
      category: "pagoda",
      durationHours: 1.5,
      tips: {
        en: "Start here in the morning before heat builds.",
        my: "မနက်ပိုင်း ပူမလာခင် လာကြည့်ပါ။",
      },
      lat: 21.1708,
      lng: 94.8678,
      day: 1,
    },
    {
      id: "demo-shwezigon",
      name: { en: "Shwezigon Pagoda", my: "ရွှေစည်းခုံစေတီ" },
      city: "Bagan",
      category: "pagoda",
      durationHours: 1,
      tips: {
        en: "In Nyaung-U; easy if you stay in town.",
        my: "ညောင်ဦးမှာ။ မြို့ထဲတည်းရင် အဆင်ပြေပါတယ်။",
      },
      lat: 21.195,
      lng: 94.893,
      day: 1,
    },
    {
      id: "demo-dhamma",
      name: { en: "Dhammayangyi Temple", my: "ဓမ္မရံကြီးဘုရား" },
      city: "Bagan",
      category: "pagoda",
      durationHours: 1,
      tips: {
        en: "Bring water; little shade on the plain.",
        my: "ရေယူလာပါ။ လွင်ပြင်မှာ အရိပ်နည်းပါတယ်။",
      },
      lat: 21.162,
      lng: 94.874,
      day: 2,
    },
    {
      id: "demo-sunset-bu",
      name: { en: "Buledi sunset mound", my: "ဗူးလည်စေတီ နေဝင်" },
      city: "Bagan",
      category: "pagoda",
      durationHours: 1,
      tips: {
        en: "Popular sunset; e-bike parking fills up.",
        my: "နေဝင်ကြည့်သူများ။ အီးဘိုက်ကားရပ်ရန် စောပါ။",
      },
      lat: 21.1735,
      lng: 94.887,
      day: 2,
    },
  ],
  hotels: [
    {
      id: "demo-hotel-bgn-1",
      name: { en: "Nyaung-U Garden Hotel", my: "ညောင်ဦး ဂါးဒင်း ဟိုတယ်" },
      city: "Bagan",
      area: { en: "Nyaung-U", my: "ညောင်ဦး" },
      priceMmkMin: 40000,
      priceMmkMax: 80000,
      phone: "061-23456",
      notes: {
        en: "Walk to restaurants and bus drop-off.",
        my: "စားသောက်ဆိုင်နဲ့ ဘတ်စ်ဆင်းရာနဲ့ နီး။",
      },
      lat: 21.199,
      lng: 94.901,
    },
    {
      id: "demo-hotel-bgn-2",
      name: { en: "Old Bagan Lodge", my: "ပုဂံဟောင်း လော့ချ်" },
      city: "Bagan",
      area: { en: "Old Bagan", my: "ပုဂံဟောင်း" },
      priceMmkMin: 70000,
      priceMmkMax: 120000,
      phone: "09-444556677",
      notes: {
        en: "Closer to temples; quieter at night.",
        my: "ဘုရားနဲ့ပိုနီး။ ညဘက် တိတ်ပါတယ်။",
      },
      lat: 21.172,
      lng: 94.86,
    },
  ],
  buses: [
    {
      id: "demo-bus-bgn-ygn",
      from: { en: "Bagan", my: "ပုဂံ" },
      to: { en: "Yangon", my: "ရန်ကုန်" },
      operator: "Elite",
      durationHours: 10,
      fareMmk: 38000,
      departWindow: { en: "Evening 16:00–18:00", my: "ညနေ ၁၆:၀၀–၁၈:၀၀" },
    },
    {
      id: "demo-bus-bgn-inle",
      from: { en: "Bagan", my: "ပုဂံ" },
      to: { en: "Nyaungshwe (Inle)", my: "ညောင်ရွှေ (အင်းလေး)" },
      operator: "Shwe Mandalar",
      durationHours: 8,
      fareMmk: 28000,
      departWindow: { en: "Morning 06:00–08:00", my: "မနက် ၀၆:၀၀–၀၈:၀၀" },
    },
  ],
};

const inle: DemoCity = {
  attractions: [
    {
      id: "demo-phaung",
      name: { en: "Phaung Daw Oo Pagoda", my: "ဖောင်တော်ဦးစေတီ" },
      city: "Inle",
      category: "pagoda",
      durationHours: 2,
      tips: {
        en: "Hire a long-tail boat from Nyaungshwe jetty.",
        my: "ညောင်ရွှေဆိပ်က ရှည်လှေငှားပါ။",
      },
      lat: 20.55,
      lng: 96.898,
      day: 1,
    },
    {
      id: "demo-innpaw",
      name: { en: "Inn Paw Khone weaving village", my: "အင်းပေါခုံ ရက်ကန်းရွာ" },
      city: "Inle",
      category: "culture",
      durationHours: 1.5,
      tips: {
        en: "Lotus and silk weaving; prices are negotiable.",
        my: "ကြာနှင့်ပိုးရက်ကန်း။ ဈေးညှိနိုင်ပါတယ်။",
      },
      lat: 20.548,
      lng: 96.91,
      day: 1,
    },
    {
      id: "demo-nyaungshwe",
      name: { en: "Nyaungshwe market", my: "ညောင်ရွှေစျေး" },
      city: "Inle",
      category: "market",
      durationHours: 1,
      tips: {
        en: "Rotating 5-day market; ask which day it is in town.",
        my: "၅ ရက်စျေး။ ဒီနေ့ မြို့မှာရှိမရှိ မေးပါ။",
      },
      lat: 20.659,
      lng: 96.934,
      day: 2,
    },
  ],
  hotels: [
    {
      id: "demo-hotel-inle-1",
      name: { en: "Canal View Guesthouse", my: "တူးမြောင်းမြင် ဧည့်ရိပ်သာ" },
      city: "Inle",
      area: { en: "Nyaungshwe", my: "ညောင်ရွှေ" },
      priceMmkMin: 35000,
      priceMmkMax: 65000,
      phone: "081-209876",
      notes: {
        en: "Boat jetty 10 minutes on foot.",
        my: "လှေဆိပ် လမ်းလျှောက် ၁၀ မိနစ်။",
      },
      lat: 20.661,
      lng: 96.933,
    },
    {
      id: "demo-hotel-inle-2",
      name: { en: "Lake Breeze Hotel", my: "အင်းလေ ဟိုတယ်" },
      city: "Inle",
      area: { en: "Mine Thauk", my: "မိုင်းသောက်" },
      priceMmkMin: 55000,
      priceMmkMax: 95000,
      phone: "09-428001122",
      notes: {
        en: "Quieter; needs a boat or motorbike.",
        my: "ပိုတိတ်။ လှေ သို့မဟုတ် ဆိုင်ကယ်လို။",
      },
      lat: 20.64,
      lng: 96.94,
    },
  ],
  buses: [
    {
      id: "demo-bus-inle-bgn",
      from: { en: "Nyaungshwe", my: "ညောင်ရွှေ" },
      to: { en: "Bagan", my: "ပုဂံ" },
      operator: "Shwe Mandalar",
      durationHours: 8,
      fareMmk: 28000,
      departWindow: { en: "Morning 05:30–07:00", my: "မနက် ၀၅:၃၀–၀၇:၀၀" },
    },
    {
      id: "demo-bus-inle-ygn",
      from: { en: "Nyaungshwe", my: "ညောင်ရွှေ" },
      to: { en: "Yangon", my: "ရန်ကုန်" },
      operator: "JJ Express",
      durationHours: 12,
      fareMmk: 42000,
      departWindow: { en: "Afternoon 13:00–15:00", my: "နေ့လည် ၁၃:၀၀–၁၅:၀၀" },
    },
  ],
};

const hpaAn: DemoCity = {
  attractions: [
    {
      id: "demo-zwegabin",
      name: { en: "Mount Zwegabin", my: "ဇွဲကပင်တောင်" },
      city: "Hpa-An",
      category: "nature",
      durationHours: 4,
      tips: {
        en: "Start at dawn; 2,400 steps. Carry water.",
        my: "မိုးသောက်ထွက်ပါ။ လှေကား ၂၄၀၀။ ရေယူပါ။",
      },
      lat: 16.812,
      lng: 97.671,
      day: 1,
    },
    {
      id: "demo-kawgun",
      name: { en: "Kawgun Cave", my: "ကော့ဂွန်းဂူ" },
      city: "Hpa-An",
      category: "heritage",
      durationHours: 1,
      tips: {
        en: "Clay Buddha reliefs; small entry fee.",
        my: "မြေစေးဘုရားများ။ ဝင်ကြေးနည်းနည်းရှိ။",
      },
      lat: 16.847,
      lng: 97.613,
      day: 2,
    },
    {
      id: "demo-kyaukkalat",
      name: { en: "Kyauk Kalat Pagoda", my: "ကျောက်ကလပ်စေတီ" },
      city: "Hpa-An",
      category: "pagoda",
      durationHours: 1,
      tips: {
        en: "Photogenic rock pinnacle; go early for shade.",
        my: "ကျောက်တုံးစေတီ။ အရိပ်ရအောင် စောစောသွားပါ။",
      },
      lat: 16.775,
      lng: 97.643,
      day: 2,
    },
  ],
  hotels: [
    {
      id: "demo-hotel-hpa-1",
      name: { en: "River Side Inn", my: "မြစ်ကမ်း အင်း" },
      city: "Hpa-An",
      area: { en: "Town center", my: "မြို့တွင်း" },
      priceMmkMin: 28000,
      priceMmkMax: 48000,
      phone: "058-21345",
      notes: {
        en: "Motorbike rental next door.",
        my: "ဘေးမှာ ဆိုင်ကယ်ငှားရ။",
      },
      lat: 16.89,
      lng: 97.635,
    },
    {
      id: "demo-hotel-hpa-2",
      name: { en: "Lime Peak Guesthouse", my: "ထုံးတောင် ဧည့်ရိပ်သာ" },
      city: "Hpa-An",
      area: { en: "Zwegabin road", my: "ဇွဲကပင်လမ်း" },
      priceMmkMin: 32000,
      priceMmkMax: 52000,
      phone: "09-425667788",
      notes: {
        en: "Closer to the mountain trailhead.",
        my: "တောင်တက်လမ်းနဲ့ ပိုနီး။",
      },
      lat: 16.87,
      lng: 97.65,
    },
  ],
  buses: [
    {
      id: "demo-bus-hpa-ygn",
      from: { en: "Hpa-An", my: "ဘားအံ" },
      to: { en: "Yangon", my: "ရန်ကုန်" },
      operator: "Khit Thit",
      durationHours: 6,
      fareMmk: 16000,
      departWindow: { en: "Morning 06:00–08:00", my: "မနက် ၀၆:၀၀–၀၈:၀၀" },
    },
    {
      id: "demo-bus-ygn-hpa",
      from: { en: "Yangon", my: "ရန်ကုန်" },
      to: { en: "Hpa-An", my: "ဘားအံ" },
      operator: "Khit Thit",
      durationHours: 6,
      fareMmk: 16000,
      departWindow: { en: "Morning 06:00–07:30", my: "မနက် ၀၆:၀၀–၀၇:၃၀" },
    },
  ],
};

export const demoByCity: Record<string, DemoCity> = {
  yangon,
  mandalay,
  bagan,
  inle,
  "hpa-an": hpaAn,
};

export const defaultDemoTrip: ChatPayload = {
  reply: {
    en: "Here is a sample Yangon to Bagan trip you can add and edit.",
    my: "ရန်ကုန်ကနေ ပုဂံသွားတဲ့ နမူနာခရီးပါ။ ထည့်ပြီး ပြင်နိုင်ပါတယ်။",
  },
  attractions: [...yangon.attractions.slice(0, 2), ...bagan.attractions.slice(0, 2)],
  hotels: [yangon.hotels[0], bagan.hotels[0]],
  buses: [yangon.buses[1]],
  itinerary: [
    { day: 1, attractionIds: ["demo-shwedagon", "demo-sule"] },
    { day: 2, attractionIds: ["demo-ananda", "demo-shwezigon"] },
  ],
  demo: true,
};
