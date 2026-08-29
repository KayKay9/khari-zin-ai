import { PHOTO } from "@/data/image-urls";
import type { DestinationChip } from "@/lib/types";

export const destinations: DestinationChip[] = [
  {
    slug: "yangon",
    name: { en: "Yangon", my: "ရန်ကုန်" },
    lat: 16.8409,
    lng: 96.1735,
    image: PHOTO.yangon,
    prompt: {
      en: "Plan 2 days in Yangon for pagodas and food.",
      my: "ရန်ကုန် ၂ ရက်၊ စေတီနဲ့ စားသောက်ဖို့ စီစဉ်ပေးပါ။",
    },
  },
  {
    slug: "mandalay",
    name: { en: "Mandalay", my: "မန္တလေး" },
    lat: 21.9588,
    lng: 96.0891,
    image: PHOTO.mandalay,
    prompt: {
      en: "Mandalay 2 days including U Bein and the palace.",
      my: "မန္တလေး ၂ ရက်၊ ဦးပိန်နဲ့ နန်းတော် ထည့်ပေးပါ။",
    },
  },
  {
    slug: "bagan",
    name: { en: "Bagan", my: "ပုဂံ" },
    lat: 21.1717,
    lng: 94.8585,
    image: PHOTO.bagan,
    prompt: {
      en: "Bagan 3 days by bus from Yangon.",
      my: "Bagan ၃ ရက်၊ ရန်ကုန်က ဘတ်စ်နဲ့သွားမယ်။",
    },
  },
  {
    slug: "inle",
    name: { en: "Inle Lake", my: "အင်းလေး" },
    lat: 20.586,
    lng: 96.91,
    image: PHOTO.inle,
    prompt: {
      en: "Inle Lake 2 days, hotels in Nyaungshwe.",
      my: "အင်းလေး ၂ ရက်၊ ညောင်ရွှေမှာ ဟိုတယ်ရှာပေးပါ။",
    },
  },
  {
    slug: "hpa-an",
    name: { en: "Hpa-An", my: "ဘားအံ" },
    lat: 16.8906,
    lng: 97.6333,
    image: PHOTO.hpaAn,
    prompt: {
      en: "Hpa-An caves and Mount Zwegabin weekend trip.",
      my: "ဘားအံ ဂူတွေနဲ့ ဇွဲကပင်တောင် စနေတနင်္ဂနွေခရီး။",
    },
  },
];
