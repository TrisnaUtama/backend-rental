import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "../src/infrastructure/utils/prisma";
import {
  Fuel,
  RatedEntityType,
  Transmission,
  Vehicle_status,
  Vehicle_Types,
} from "@prisma/client";

async function main() {
  try {
    const hashed_password = await Bun.password.hash(
      "password",
      "bcrypt"
    );
    await prisma.users.create({
      data: {
        email: "admin@ex.com",
        name: "admin",
        password: hashed_password,
        phone_number: "99237404852",
        is_verified: true,
        status: true,
        role: "SUPERADMIN",
        year_of_experiences: 0,
      },
    });

    const customers = [];
    for (let i = 1; i <= 10; i++) {
      const password = `password${i}`;
      const hashed_password = await Bun.password.hash(password, "bcrypt");
      const customer = await prisma.users.create({
        data: {
          email: `customer${i}@ex.com`,
          name: `Customer ${i}`,
          password: hashed_password,
          phone_number: `123456789${i.toString().padStart(2, "0")}`,
          is_verified: true,
          status: true,
          role: "CUSTOMER",
          year_of_experiences: 0,
        },
      });
      customers.push(customer);
      console.log(`Seeded CUSTOMER user: ${customer.email}`);
    }

    const accommodationsData = [
      {
        name: "The Apurva Kempinski Bali",
        address: "Jl. Raya Nusa Dua Selatan, Sawangan, Nusa Dua, Bali",
        description:
          "Standing atop the majestic cliff of Nusa Dua, with breathtaking views of the Indian Ocean and a tropical garden, The Apurva Kempinski Bali offers the epitome of beachfront luxury.",
        image_urls: [
          "https://pix10.agoda.net/hotelImages/744/7444397/7444397_220504153700108139682.jpg?ca=22&ce=0&s=1024x768",
          "https://pix10.agoda.net/hotelImages/744/7444397/7444397_220504153900108140351.jpg?ca=22&ce=0&s=1024x768",
          "https://pix10.agoda.net/hotelImages/7444397/0/233e7939a82e92cff990391515939aa5.jpg?ca=8&ce=1&s=1024x768",
        ],
        price_per_night: 5500000.0,
        facilities: [
          "Swimming Pool",
          "Restaurant",
          "Spa",
          "Fitness Center",
          "Beachfront",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "Hotel Tentrem Yogyakarta",
        address:
          "Jl. P. Mangkubumi No.72A, Cokrodiningratan, Jetis, Yogyakarta",
        description:
          "A five-star hotel that combines modern design with a touch of Javanese culture. Offering serene comfort and impeccable service in the heart of Yogyakarta.",
        image_urls: [
          "https://media-cdn.tripadvisor.com/media/photo-s/1a/c0/86/89/hotel-tentrem-yogyakarta.jpg",
          "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/208883995.jpg?k=3248386a3478c9462779a545c3c86c121434856417701e6628e93a6cf129424e&o=",
          "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/c0/86/93/swimming-pool.jpg?w=1200&h=-1&s=1",
        ],
        price_per_night: 2100000.0,
        facilities: [
          "Swimming Pool",
          "Restaurant",
          "Spa",
          "Fitness Center",
          "Parking",
          "AC",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "AYANA Resort Bali",
        address: "Jl. Karang Mas Sejahtera, Jimbaran, Bali",
        description:
          "A world-class destination resort located on 90 hectares of cliff-top land perched above Jimbaran Bay. Features the famous Rock Bar and stunning ocean views.",
        image_urls: [
          "https://www.ayana.com/bali/ayana-resort-and-spa/media/bali_en_1-villas-at-ayana-resort-750x422.jpg",
          "https://www.ayana.com/media/2437320/view-from-lobby-2.jpg",
          "https://www.ayana.com/media/1962201/ayana-resort-bade-pool-750x422.jpg",
        ],
        price_per_night: 4800000.0,
        facilities: [
          "Private Beach",
          "12 Swimming Pools",
          "Spa",
          "Rock Bar",
          "Golf Course",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "Adhisthana Hotel Yogyakarta",
        address:
          "Jl. Prawirotaman II No.613, Brontokusuman, Mergangsan, Yogyakarta",
        description:
          "A stylish hotel with a unique blend of Javanese, Colonial, and industrial design elements. Located in the vibrant Prawirotaman tourist area, known for its art scene and cafes.",
        image_urls: [
          "https://pix10.agoda.net/hotelImages/936/936495/936495_17082111560055581971.jpg?s=1024x768",
          "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/13/28/39/adhisthana-hotel-yogyakarta.jpg?w=1200&h=-1&s=1",
          "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/87502123.jpg?k=b4f84976c645e7f9c7333553229b9bb25838565a12d1b72e126139945115c6d3&o=",
        ],
        price_per_night: 650000.0,
        facilities: [
          "Swimming Pool",
          "Restaurant",
          "Cafe",
          "Parking",
          "AC",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "Katamaran Hotel & Resort",
        address: "Jl. Raya Mangsit, Senggigi, Lombok, Nusa Tenggara Barat",
        description:
          "An oceanfront paradise with a pristine beach in the heart of Senggigi. Offers luxurious suites and villas with private pools and spectacular sunset views.",
        image_urls: [
          "https://media-cdn.tripadvisor.com/media/photo-s/0e/65/52/62/katamaran-resort.jpg",
          "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/94635106.jpg?k=8050604e76a6e5585b4104252610582d96c80529d4993a43657596048d575440&o=",
          "https://pix10.agoda.net/hotelImages/1169601/0/5502e6488d047b1e831aa1975e2f758f.jpg?s=1024x768",
        ],
        price_per_night: 1800000.0,
        facilities: [
          "Swimming Pool",
          "Beachfront",
          "Restaurant",
          "Spa",
          "Fitness Center",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "Fairmont Jakarta",
        address: "Jl. Asia Afrika No.8, Gelora, Tanah Abang, Jakarta Pusat",
        description:
          "Provides luxurious comfort and spectacular city views. Offers direct access to Plaza Senayan and the Sentral Senayan office towers.",
        image_urls: [
          "https://www.fairmont.com/rsc/img/loading-overlay-1920x1080.jpg",
          "https://pix10.agoda.net/hotelImages/701/701452/701452_14090315140021598075.jpg?s=1024x768",
          "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/56434407.jpg?k=95f334a113a35a7f928a6e87f7b3c43496c21a34371ac9048a1d120a233b664d&o=",
        ],
        price_per_night: 3200000.0,
        facilities: [
          "Swimming Pool",
          "Restaurant",
          "Spa",
          "Direct Mall Access",
          "Fitness Center",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "Padma Hotel Bandung",
        address: "Jl. Rancabentang No. 56-58, Ciumbuleuit, Bandung, Jawa Barat",
        description:
          "A spectacular hotel that blends with nature. Located in the hills of Ciumbuleuit, offering breathtaking views, fresh air, and a serene atmosphere.",
        image_urls: [
          "https://www.padmahotelbandung.com/media/1672688/padma-bandung-pool-1.jpg",
          "https://media-cdn.tripadvisor.com/media/photo-s/13/d4/0e/85/getlstd-property-photo.jpg",
          "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/299653069.jpg?k=1481b0f55e378c69f257a02c818f2d57d75b31e98a335f60e9092496a7590c2e&o=",
        ],
        price_per_night: 2500000.0,
        facilities: [
          "Heated Infinity Pool",
          "Jacuzzi",
          "Mini Zoo",
          "Restaurant",
          "Fitness Center",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "YATS Colony",
        address: "Jl. Patangpuluhan No.23, Wirobrajan, Yogyakarta",
        description:
          "A unique urban-style hotel in Yogyakarta, combining a boutique hotel, restaurant, and creative space. Perfect for travelers seeking a modern and artistic vibe.",
        image_urls: [
          "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/107077063.jpg?k=1092e071e626d573a4b98687255aa0a6d0c73335b3762464731885f8fdf12739&o=",
          "https://media-cdn.tripadvisor.com/media/photo-s/11/44/21/68/yats-colony.jpg",
          "https://indonesiadesign.com/wp-content/uploads/2018/02/yats-colony-id-2.jpg",
        ],
        price_per_night: 850000.0,
        facilities: [
          "Swimming Pool",
          "Restaurant",
          "Boutique Shop",
          "AC",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "Mulia Resort & Villas Nusa Dua",
        address: "Jl. Raya Nusa Dua Selatan, Kawasan Sawangan, Nusa Dua, Bali",
        description:
          "An ultra-high-end brand from Mulia, offering breathtaking beachfront suites, iconic pools, and an exclusive, tranquil atmosphere.",
        image_urls: [
          "https://www.themulia.com/images/gallery/mulia-bali-resort/The-Mulia-Oasis-Pool-1-1.jpg",
          "https://www.themulia.com/images/gallery/mulia-bali-resort/mulia-resort-grandeur-deluxe-room.jpg",
          "https://pix10.agoda.net/hotelImages/408/408337/408337_17071217090054452187.jpg?s=1024x768",
        ],
        price_per_night: 3500000.0,
        facilities: [
          "Oasis Pool",
          "Beachfront",
          "9 Restaurants & Bars",
          "Spa",
          "Fitness Center",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "Amnaya Resort Kuta",
        address: "Jl. Kartika Plaza Gg. Puspa Ayu No.99, Kuta, Bali",
        description:
          "A tranquil hideaway in the heart of bustling Kuta. Offers a serene environment, personalized service, and beautifully designed rooms.",
        image_urls: [
          "https://pix10.agoda.net/hotelImages/116/1169115/1169115_16081620000045501865.jpg?s=1024x768",
          "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/81062035.jpg?k=d3e02028c1cd8513511b8162f406606353d71954316f461e7cc4da2d486d3b37&o=",
          "https://media-cdn.tripadvisor.com/media/photo-s/1d/18/43/d8/exterior.jpg",
        ],
        price_per_night: 1100000.0,
        facilities: [
          "Swimming Pool",
          "Restaurant",
          "Spa",
          "Library",
          "AC",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "Raffles Jakarta",
        address:
          "Ciputra World 1, Jl. Prof. DR. Satrio Kav. 3-5, Kuningan, Jakarta",
        description:
          "A celebration of artistry and elegance. The hotel is exclusively linked to Ciputra Artpreneur Centre, a testament to the owner's devotion to the arts.",
        image_urls: [
          "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/338166609.jpg?k=34423793b890a5015c7e0b57e754a93557e930fef8b8686708785cf66d87e05e&o=",
          "https://pix10.agoda.net/hotelImages/741/741164/741164_15080517040033669677.jpg?s=1024x768",
        ],
        price_per_night: 4100000.0,
        facilities: [
          "Swimming Pool",
          "Art Gallery Access",
          "Spa",
          "Restaurant",
          "Fitness Center",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "Plataran Borobudur Resort & Spa",
        address: "Dusun Tanjungan, Borobudur, Magelang, Jawa Tengah",
        description:
          "Escape to a tranquil oasis nestled in the hills of Tanjungan, offering breathtaking views of the legendary Borobudur Temple and the surrounding Menoreh Hills.",
        image_urls: [
          "https://plataran.com/wp-content/uploads/2021/01/Plataran-Borobudur-Resort-Spa-Patio-Restaurant-2.jpg",
          "https://plataran.com/wp-content/uploads/2023/11/Website-Special-Offer-Thumbnail-Stay-3-Pay-2-Plataran-Borobudur.jpg",
        ],
        price_per_night: 3800000.0,
        facilities: [
          "Infinity Pool",
          "View of Borobudur",
          "Spa",
          "Restaurant",
          "Yoga Deck",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "The Ritz-Carlton, Bali",
        address:
          "Jalan Raya Nusa Dua Selatan Lot III, Sawangan, Nusa Dua, Bali",
        description:
          "A luxurious resort where tranquil waters meet a white-sand beach. Enjoy oceanfront villas, a stunning spa, and exceptional dining experiences.",
        image_urls: [
          "https://www.ritzcarlton.com/content/dam/the-ritz-carlton/hotels/dpssw/dpssw-cliff-villa-pool-view-50669259.jpg?impolicy=v1-image-gen",
          "https://pix10.agoda.net/hotelImages/699/699599/699599_15060411210029517929.jpg?s=1024x768",
        ],
        price_per_night: 6200000.0,
        facilities: [
          "Beachfront",
          "Hydro-Vital Pool",
          "Spa",
          "Kids Club",
          "5 Restaurants & Bars",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "Greenhost Boutique Hotel Prawirotaman",
        address: "Jl. Prawirotaman II No. 629, Brontokusuman, Yogyakarta",
        description:
          "An eco-conscious boutique hotel with a unique 'Creative Farming' concept. Features industrial design and a commitment to sustainability.",
        image_urls: [
          "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/49885834.jpg?k=f8b22a27b8bfcfc39121a1b1bdc0a7018d9f481c54823908f9c1585c882db867&o=",
          "https://media-cdn.tripadvisor.com/media/photo-s/08/93/b9/01/greenhost-boutique-hotel.jpg",
        ],
        price_per_night: 720000.0,
        facilities: [
          "Swimming Pool",
          "Rooftop Garden",
          "Eco-friendly",
          "Restaurant",
          "AC",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "W Bali - Seminyak",
        address: "Jl. Petitenget, Kerobokan, Seminyak, Bali",
        description:
          "A vibrant and stylish resort in the heart of Seminyak. Famous for its energetic atmosphere, chic design, and the iconic Woobar.",
        image_urls: [
          "https://pix10.agoda.net/hotelImages/245/245903/245903_230926154600185994270.jpg?ca=23&ce=0&s=1024x768",
          "https://www.marriott.com/content/dam/marriott-digital/w/dpswh/en_us/photos/2023/w-bali-seminyak-exterior-2-2050-16923.jpeg",
        ],
        price_per_night: 7100000.0,
        facilities: [
          "WET Pool",
          "Woobar",
          "AWAY Spa",
          "FIT Gym",
          "Beach Access",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "Hotel Indonesia Kempinski Jakarta",
        address: "Jl. M.H. Thamrin No.1, Menteng, Jakarta Pusat",
        description:
          "A historic landmark located in the heart of the city, directly opposite the iconic Bundaran HI. Offers timeless elegance and direct access to Grand Indonesia mall.",
        image_urls: [
          "https://pix10.agoda.net/hotelImages/444/44422/44422_16061417120043589832.jpg?s=1024x768",
          "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/502120002.jpg?k=5b263b827e1f13346f338d82138ff91b1f6920f01a37c95b6c3848b788a531e0&o=",
        ],
        price_per_night: 3500000.0,
        facilities: [
          "Rooftop Pool",
          "Direct Mall Access",
          "Spa",
          "Signatures Restaurant",
          "Fitness Center",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "Jeeva Klui Resort",
        address: "Jl. Raya Klui Beach No. 1, Malaka, Lombok",
        description:
          "An exotic blend of sea, sand, and mountains. An effortlessly chic and boutique resort providing a tranquil and romantic escape on the pristine Klui Beach.",
        image_urls: [
          "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/33423759.jpg?k=d09b67323b7e7ab4377bb4580b0804473b13735749f99e320f2b3e4453b51f8a&o=",
          "https://media-cdn.tripadvisor.com/media/photo-s/02/76/90/a6/jeeva-klui-resort.jpg",
        ],
        price_per_night: 2200000.0,
        facilities: [
          "Beachfront",
          "Infinity Pool",
          "Spa",
          "Restaurant",
          "AC",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "Hyatt Regency Yogyakarta",
        address:
          "Jl. Palagan Tentara Pelajar, Panggung Sari, Sariharjo, Ngaglik, Sleman, Yogyakarta",
        description:
          "Set within 22 hectares of beautifully landscaped gardens, this resort features a 9-hole golf course, a beautiful swimming pool, and a serene Javanese atmosphere.",
        image_urls: [
          "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/04/12/1235/JOGJA-P0963-Hotel-Exterior-And-Lanscape.jpg/JOGJA-P0963-Hotel-Exterior-And-Lanscape.16x9.jpg",
          "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/19321773.jpg?k=15c8e29a99e82c5e5330ce1bb24810795c62df50c18d0c2e3612543e3f05b9b1&o=",
        ],
        price_per_night: 1300000.0,
        facilities: [
          "Swimming Pool",
          "Golf Course",
          "Spa",
          "Restaurant",
          "Fitness Center",
          "WiFi",
        ],
        status: true,
      },
      {
        name: "Four Seasons Resort Bali at Sayan",
        address:
          "Jl. Raya Sayan, Sayan, Kecamatan Ubud, Kabupaten Gianyar, Bali",
        description:
          "A magical jungle hideaway nestled between two rivers. Enter via a dramatic bridge and unwind in luxurious suites and villas.",
        image_urls: [
          "https://www.fourseasons.com/alt/img-opt/~70.1530.0,0000-0,0000-1600,0000-900,0000/publish/content/dam/fourseasons/images/web/SAY/SAY_004_original.jpg",
          "https://www.fourseasons.com/alt/img-opt/~70.1530.0,0000-0,0000-1600,0000-900,0000/publish/content/dam/fourseasons/images/web/SAY/SAY_184_original.jpg",
        ],
        price_per_night: 14500000.0,
        facilities: [
          "Riverside Pool",
          "Sacred River Spa",
          "Yoga Bale",
          "Restaurant",
          "Fitness Center",
          "WiFi",
        ],
        status: true,
      },
    ];

    const destinations = [
      {
        id: "cmbi8isi90000sd5aj9o0k2gn",
        name: "Jimbaran Bay",
        open_hour: "08:00 - 17:00",
        description: "Known for its rich history and cultural attractions.",
        image_urls: [
          "https://dummyimage.com/800x600",
          "https://dummyimage.com/300x300",
        ],
        address: "Jl. Pariwisata No. 45, Daerah Liburan",
        category: "Neighborhoods",
        facilities: ["Wi-Fi", "Restoran", "Pusat Oleh-Oleh"],
        status: true,
        created_at: "2025-06-04T17:42:00.657Z",
        updated_at: "2025-06-04T17:42:00.657Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isip0001sd5af5wlxfl1",
        name: "Waterbom Bali",
        open_hour: "09:00 - 18:00",
        description: "Perfect for family vacations and relaxing getaways.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Dummy No. 123, Kota Wisata",
        category: "Water Parks",
        facilities: ["Wi-Fi", "Restoran", "Pusat Oleh-Oleh"],
        status: true,
        created_at: "2025-06-04T17:42:00.673Z",
        updated_at: "2025-06-04T17:42:00.673Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isju0002sd5a4qy9sut3",
        name: "Balangan Beach",
        open_hour: "08:00 - 17:00",
        description: "Perfect for family vacations and relaxing getaways.",
        image_urls: ["https://dummyimage.com/500x500"],
        address: "Jl. Dummy No. 123, Kota Wisata",
        category: "Beaches",
        facilities: ["Toilet", "Parkir", "Mushola"],
        status: true,
        created_at: "2025-06-04T17:42:00.678Z",
        updated_at: "2025-06-04T17:42:00.678Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isiy0003sd5azop7ryvg",
        name: "Tirta Empul Temple",
        open_hour: "08:00 - 17:00",
        description:
          "A beautiful destination with stunning views and exciting experiences.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Pariwisata No. 45, Daerah Liburan",
        category: "Historical & Heritage Tours",
        facilities: ["Toilet", "Parkir", "Mushola"],
        status: true,
        created_at: "2025-06-04T17:42:00.683Z",
        updated_at: "2025-06-04T17:42:00.683Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isj10004sd5adr8xfahb",
        name: "Gunung Payung Cultural Park",
        open_hour: "08:00 - 17:00",
        description:
          "A beautiful destination with stunning views and exciting experiences.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Pariwisata No. 45, Daerah Liburan",
        category: "Points of Interest & Landmarks",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.686Z",
        updated_at: "2025-06-04T17:42:00.686Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isj50005sd5a907kkfl7",
        name: "Uluwatu Temple",
        open_hour: "09:00 - 18:00",
        description: "Perfect for family vacations and relaxing getaways.",
        image_urls: [
          "https://dummyimage.com/800x600",
          "https://dummyimage.com/300x300",
        ],
        address: "Jl. Pariwisata No. 45, Daerah Liburan",
        category: "Religious Sites",
        facilities: ["Toilet", "Parkir", "Mushola"],
        status: true,
        created_at: "2025-06-04T17:42:00.689Z",
        updated_at: "2025-06-04T17:42:00.689Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isj80006sd5a98p81413",
        name: "Bali Zoo",
        open_hour: "07:00 - 15:00",
        description:
          "A beautiful destination with stunning views and exciting experiences.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Zoos",
        facilities: ["Toilet", "Parkir", "Mushola"],
        status: true,
        created_at: "2025-06-04T17:42:00.693Z",
        updated_at: "2025-06-04T17:42:00.693Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isjb0007sd5at6jglve6",
        name: "Mount Batur",
        open_hour: "09:00 - 18:00",
        description: "Perfect for family vacations and relaxing getaways.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Dummy No. 123, Kota Wisata",
        category: "Mountains",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.696Z",
        updated_at: "2025-06-04T17:42:00.696Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isjf0008sd5aubbzynmi",
        name: "Toya Devasya Hot Spring",
        open_hour: "09:00 - 18:00",
        description: "Known for its rich history and cultural attractions.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Dummy No. 123, Kota Wisata",
        category: "Spas",
        facilities: ["Wi-Fi", "Restoran", "Pusat Oleh-Oleh"],
        status: true,
        created_at: "2025-06-04T17:42:00.700Z",
        updated_at: "2025-06-04T17:42:00.700Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isji0009sd5a7fqniepz",
        name: "Bali Bird Park",
        open_hour: "09:00 - 18:00",
        description:
          "A beautiful destination with stunning views and exciting experiences.",
        image_urls: ["https://dummyimage.com/500x500"],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Nature & Wildlife Areas",
        facilities: ["Toilet", "Parkir", "Mushola"],
        status: true,
        created_at: "2025-06-04T17:42:00.702Z",
        updated_at: "2025-06-04T17:42:00.702Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isjl000asd5asj3v6nk2",
        name: "Kuta Beach - Bali",
        open_hour: "09:00 - 18:00",
        description:
          "A beautiful destination with stunning views and exciting experiences.",
        image_urls: ["https://dummyimage.com/500x500"],
        address: "Jl. Dummy No. 123, Kota Wisata",
        category: "Beaches",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.705Z",
        updated_at: "2025-06-04T17:42:00.705Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isjo000bsd5ai7m6zipc",
        name: "Pandawa Beach",
        open_hour: "08:00 - 17:00",
        description: "Known for its rich history and cultural attractions.",
        image_urls: [
          "https://dummyimage.com/800x600",
          "https://dummyimage.com/300x300",
        ],
        address: "Jl. Pariwisata No. 45, Daerah Liburan",
        category: "Beaches",
        facilities: ["Wi-Fi", "Restoran", "Pusat Oleh-Oleh"],
        status: true,
        created_at: "2025-06-04T17:42:00.708Z",
        updated_at: "2025-06-04T17:42:00.708Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isjr000csd5a71m65fum",
        name: "Pantai Dreamland",
        open_hour: "09:00 - 18:00",
        description: "Perfect for family vacations and relaxing getaways.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Pariwisata No. 45, Daerah Liburan",
        category: "Beaches",
        facilities: ["Wi-Fi", "Restoran", "Pusat Oleh-Oleh"],
        status: true,
        created_at: "2025-06-04T17:42:00.712Z",
        updated_at: "2025-06-04T17:42:00.712Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isju000dsd5atex3sgoo",
        name: "Sacred Monkey Forest Sanctuary",
        open_hour: "07:00 - 15:00",
        description: "Known for its rich history and cultural attractions.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Pariwisata No. 45, Daerah Liburan",
        category: "Nature & Wildlife Areas",
        facilities: ["Wi-Fi", "Restoran", "Pusat Oleh-Oleh"],
        status: true,
        created_at: "2025-06-04T17:42:00.714Z",
        updated_at: "2025-06-04T17:42:00.714Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isjw000esd5aucosltd9",
        name: "Tegalalang Rice Terrace",
        open_hour: "07:00 - 15:00",
        description: "Perfect for family vacations and relaxing getaways.",
        image_urls: [
          "https://dummyimage.com/800x600",
          "https://dummyimage.com/300x300",
        ],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Points of Interest & Landmarks",
        facilities: ["Wi-Fi", "Restoran", "Pusat Oleh-Oleh"],
        status: true,
        created_at: "2025-06-04T17:42:00.716Z",
        updated_at: "2025-06-04T17:42:00.716Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isjy000fsd5a4vf1kq0o",
        name: "Jatiluwih Green Land",
        open_hour: "07:00 - 15:00",
        description: "Known for its rich history and cultural attractions.",
        image_urls: ["https://dummyimage.com/500x500"],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Points of Interest & Landmarks",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.719Z",
        updated_at: "2025-06-04T17:42:00.719Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isk0000gsd5arosu6zlq",
        name: "Sekumpul Waterfall",
        open_hour: "07:00 - 15:00",
        description:
          "A beautiful destination with stunning views and exciting experiences.",
        image_urls: [
          "https://dummyimage.com/800x600",
          "https://dummyimage.com/300x300",
        ],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Waterfalls",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.721Z",
        updated_at: "2025-06-04T17:42:00.721Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isk3000hsd5ay42g3e3k",
        name: "Campuhan Ridge Walk",
        open_hour: "09:00 - 18:00",
        description: "Known for its rich history and cultural attractions.",
        image_urls: [
          "https://dummyimage.com/800x600",
          "https://dummyimage.com/300x300",
        ],
        address: "Jl. Dummy No. 123, Kota Wisata",
        category: "Scenic Walking Areas",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.724Z",
        updated_at: "2025-06-04T17:42:00.724Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isk6000isd5aip8we297",
        name: "Tegenungan Waterfall",
        open_hour: "08:00 - 17:00",
        description: "Known for its rich history and cultural attractions.",
        image_urls: ["https://dummyimage.com/500x500"],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Waterfalls",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.727Z",
        updated_at: "2025-06-04T17:42:00.727Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isk9000jsd5anm9iar1l",
        name: "Taro Village Experience",
        open_hour: "07:00 - 15:00",
        description: "Perfect for family vacations and relaxing getaways.",
        image_urls: ["https://dummyimage.com/500x500"],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Nature & Wildlife Areas",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.730Z",
        updated_at: "2025-06-04T17:42:00.730Z",
        deleted_at: null,
      },
      {
        id: "cmbi8iskc000ksd5awh4mker0",
        name: "Saraswati Temple",
        open_hour: "09:00 - 18:00",
        description:
          "A beautiful destination with stunning views and exciting experiences.",
        image_urls: ["https://dummyimage.com/500x500"],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Religious Sites",
        facilities: ["Toilet", "Parkir", "Mushola"],
        status: true,
        created_at: "2025-06-04T17:42:00.732Z",
        updated_at: "2025-06-04T17:42:00.732Z",
        deleted_at: null,
      },
      {
        id: "cmbi8iske000lsd5aui7d4fr6",
        name: "Elephant Cave",
        open_hour: "09:00 - 18:00",
        description:
          "A beautiful destination with stunning views and exciting experiences.",
        image_urls: [
          "https://dummyimage.com/800x600",
          "https://dummyimage.com/300x300",
        ],
        address: "Jl. Dummy No. 123, Kota Wisata",
        category: "Caverns & Caves",
        facilities: ["Toilet", "Parkir", "Mushola"],
        status: true,
        created_at: "2025-06-04T17:42:00.735Z",
        updated_at: "2025-06-04T17:42:00.735Z",
        deleted_at: null,
      },
      {
        id: "cmbi8iski000msd5ahtmdhrsf",
        name: "Neka Art Museum",
        open_hour: "08:00 - 17:00",
        description: "Perfect for family vacations and relaxing getaways.",
        image_urls: ["https://dummyimage.com/500x500"],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Speciality Museums",
        facilities: ["Toilet", "Parkir", "Mushola"],
        status: true,
        created_at: "2025-06-04T17:42:00.738Z",
        updated_at: "2025-06-04T17:42:00.738Z",
        deleted_at: null,
      },
      {
        id: "cmbi8iskk000nsd5a30b1c4xw",
        name: "Museum Puri Lukisan",
        open_hour: "09:00 - 18:00",
        description:
          "A beautiful destination with stunning views and exciting experiences.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Art Museums",
        facilities: ["Wi-Fi", "Restoran", "Pusat Oleh-Oleh"],
        status: true,
        created_at: "2025-06-04T17:42:00.741Z",
        updated_at: "2025-06-04T17:42:00.741Z",
        deleted_at: null,
      },
      {
        id: "cmbi8iskn000osd5a86dv4dfb",
        name: "Don Antonio Blanco Museum",
        open_hour: "07:00 - 15:00",
        description: "Perfect for family vacations and relaxing getaways.",
        image_urls: ["https://dummyimage.com/500x500"],
        address: "Jl. Pariwisata No. 45, Daerah Liburan",
        category: "Art Museums",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.743Z",
        updated_at: "2025-06-04T17:42:00.743Z",
        deleted_at: null,
      },
      {
        id: "cmbi8iskp000psd5abxpy8xfu",
        name: "Kecak Fire & Trance Dance Pura Dalem Taman Kaja",
        open_hour: "07:00 - 15:00",
        description:
          "A beautiful destination with stunning views and exciting experiences.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Pariwisata No. 45, Daerah Liburan",
        category: "Religious Sites",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.746Z",
        updated_at: "2025-06-04T17:42:00.746Z",
        deleted_at: null,
      },
      {
        id: "cmbi8iskr000qsd5a5sbbpb3x",
        name: "Pantai Double Six",
        open_hour: "09:00 - 18:00",
        description:
          "A beautiful destination with stunning views and exciting experiences.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Beaches",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.748Z",
        updated_at: "2025-06-04T17:42:00.748Z",
        deleted_at: null,
      },
      {
        id: "cmbi8iskt000rsd5an1icyj0y",
        name: "Purpa Fine Art Gallery Seminyak",
        open_hour: "07:00 - 15:00",
        description: "Known for its rich history and cultural attractions.",
        image_urls: [
          "https://dummyimage.com/800x600",
          "https://dummyimage.com/300x300",
        ],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Art Galleries",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.750Z",
        updated_at: "2025-06-04T17:42:00.750Z",
        deleted_at: null,
      },
      {
        id: "cmbi8iskw000ssd5agzmyx3xe",
        name: "Koral Restaurant",
        open_hour: "08:00 - 17:00",
        description:
          "A beautiful destination with stunning views and exciting experiences.",
        image_urls: ["https://dummyimage.com/500x500"],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Restaurant",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.752Z",
        updated_at: "2025-06-04T17:42:00.752Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isky000tsd5aczxlb7zs",
        name: "Ely's Kitchen Ubud",
        open_hour: "09:00 - 18:00",
        description:
          "A beautiful destination with stunning views and exciting experiences.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Pariwisata No. 45, Daerah Liburan",
        category: "Restaurant",
        facilities: ["Wi-Fi", "Restoran", "Pusat Oleh-Oleh"],
        status: true,
        created_at: "2025-06-04T17:42:00.754Z",
        updated_at: "2025-06-04T17:42:00.754Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isl0000usd5away4mq9w",
        name: "Boy'N'Cow",
        open_hour: "07:00 - 15:00",
        description: "Known for its rich history and cultural attractions.",
        image_urls: ["https://dummyimage.com/500x500"],
        address: "Jl. Pariwisata No. 45, Daerah Liburan",
        category: "Restaurant",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.757Z",
        updated_at: "2025-06-04T17:42:00.757Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isl2000vsd5arslka62p",
        name: "Nostimo Greek Grill Bali",
        open_hour: "07:00 - 15:00",
        description: "Known for its rich history and cultural attractions.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Dummy No. 123, Kota Wisata",
        category: "Restaurant",
        facilities: ["Toilet", "Parkir", "Mushola"],
        status: true,
        created_at: "2025-06-04T17:42:00.759Z",
        updated_at: "2025-06-04T17:42:00.759Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isl5000wsd5adumf0yjo",
        name: "Livingstone Cafe & Bakery",
        open_hour: "07:00 - 15:00",
        description: "Known for its rich history and cultural attractions.",
        image_urls: [
          "https://dummyimage.com/800x600",
          "https://dummyimage.com/300x300",
        ],
        address: "Jl. Pariwisata No. 45, Daerah Liburan",
        category: "Restaurant",
        facilities: ["Wi-Fi", "Restoran", "Pusat Oleh-Oleh"],
        status: true,
        created_at: "2025-06-04T17:42:00.761Z",
        updated_at: "2025-06-04T17:42:00.761Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isl8000xsd5au263xehh",
        name: "Made's Warung",
        open_hour: "09:00 - 18:00",
        description: "Perfect for family vacations and relaxing getaways.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Restaurant",
        facilities: ["Wi-Fi", "Restoran", "Pusat Oleh-Oleh"],
        status: true,
        created_at: "2025-06-04T17:42:00.764Z",
        updated_at: "2025-06-04T17:42:00.764Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isla000ysd5az8prt5m7",
        name: "Naughty Nuri's Seminyak",
        open_hour: "07:00 - 15:00",
        description: "Known for its rich history and cultural attractions.",
        image_urls: [
          "https://dummyimage.com/800x600",
          "https://dummyimage.com/300x300",
        ],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Restaurant",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.767Z",
        updated_at: "2025-06-04T17:42:00.767Z",
        deleted_at: null,
      },
      {
        id: "cmbi8isld000zsd5anodjgtyr",
        name: "Bebek Tepi Sawah",
        open_hour: "07:00 - 15:00",
        description: "Perfect for family vacations and relaxing getaways.",
        image_urls: [
          "https://dummyimage.com/800x600",
          "https://dummyimage.com/300x300",
        ],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Restaurant",
        facilities: ["Pemandu Wisata", "Pusat Informasi", "Tempat Istirahat"],
        status: true,
        created_at: "2025-06-04T17:42:00.769Z",
        updated_at: "2025-06-04T17:42:00.769Z",
        deleted_at: null,
      },
      {
        id: "cmbi8islg0010sd5afti6dn62",
        name: "Warung Babi Guling Ibu Oka 3",
        open_hour: "07:00 - 15:00",
        description: "Perfect for family vacations and relaxing getaways.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Dummy No. 123, Kota Wisata",
        category: "Restaurant",
        facilities: ["Wi-Fi", "Restoran", "Pusat Oleh-Oleh"],
        status: true,
        created_at: "2025-06-04T17:42:00.773Z",
        updated_at: "2025-06-04T17:42:00.773Z",
        deleted_at: null,
      },
      {
        id: "cmbi8islj0011sd5aed26kfal",
        name: "Nasi Ayam Kedewatan Ibu Mangku",
        open_hour: "09:00 - 18:00",
        description: "Known for its rich history and cultural attractions.",
        image_urls: [
          "https://dummyimage.com/600x400",
          "https://dummyimage.com/400x300",
        ],
        address: "Jl. Pelancong Raya No. 89, Tempat Indah",
        category: "Restaurant",
        facilities: ["Wi-Fi", "Restoran", "Pusat Oleh-Oleh"],
        status: true,
        created_at: "2025-06-04T17:42:00.775Z",
        updated_at: "2025-06-04T17:42:00.775Z",
        deleted_at: null,
      },
    ];

    const vehiclesData = [
      {
        name: "Toyota Avanza G",
        type: Vehicle_Types.MPV,
        transmition: Transmission.AUTOMATIC,
        status: Vehicle_status.AVAILABLE,
        fuel: Fuel.PERTAMAXTURBO,
        brand: "Toyota",
        capacity: 7,
        kilometer: 25000,
        year: 2023,
        price_per_day: 350000.0,
        image_url: [
          "https://dummyimage.com/600x400/000/fff&text=Avanza+1",
          "https://dummyimage.com/600x400/ccc/000&text=Avanza+2",
        ],
        description:
          "Mobil keluarga andalan Indonesia. Irit, luas, dan nyaman untuk perjalanan dalam kota maupun luar kota.",
        color: "Silver Metallic",
      },
      {
        name: "Honda Brio Satya E",
        type: Vehicle_Types.HATCHBACK,
        transmition: Transmission.MANUAL,
        status: Vehicle_status.AVAILABLE,
        fuel: Fuel.PERTAMAXTURBO,
        brand: "Honda",
        capacity: 5,
        kilometer: 15000,
        year: 2024,
        price_per_day: 280000.0,
        image_url: ["https://dummyimage.com/600x400/ff0000/fff&text=Brio+1"],
        description:
          "City car lincah dan hemat bahan bakar. Cocok untuk mobilitas tinggi di perkotaan yang padat.",
        color: "Rallye Red",
      },
      {
        name: "Mitsubishi Xpander Ultimate",
        type: Vehicle_Types.MPV,
        transmition: Transmission.AUTOMATIC,
        status: Vehicle_status.RENTED,
        fuel: Fuel.PERTAMAXTURBO,
        brand: "Mitsubishi",
        capacity: 7,
        kilometer: 45000,
        year: 2022,
        price_per_day: 400000.0,
        image_url: ["https://dummyimage.com/600x400/333/fff&text=Xpander+1"],
        description:
          "MPV modern dengan desain futuristik, kabin senyap, dan fitur canggih untuk kenyamanan maksimal.",
        color: "Jet Black Mica",
      },
      {
        name: "Daihatsu Terios R",
        type: Vehicle_Types.SUV,
        transmition: Transmission.AUTOMATIC,
        status: Vehicle_status.AVAILABLE,
        fuel: Fuel.PERTAMAXTURBO,
        brand: "Daihatsu",
        capacity: 7,
        kilometer: 32000,
        year: 2022,
        price_per_day: 380000.0,
        image_url: ["https://dummyimage.com/600x400/fff/000&text=Terios+1"],
        description:
          "SUV tangguh dan serbaguna, siap menemani petualangan Anda di berbagai kondisi jalan.",
        color: "Icy White",
      },
      {
        name: "Hyundai Ioniq 5 Prime",
        type: Vehicle_Types.SUV,
        transmition: Transmission.AUTOMATIC,
        status: Vehicle_status.AVAILABLE,
        fuel: Fuel.PERTALITE,
        brand: "Hyundai",
        capacity: 5,
        kilometer: 8000,
        year: 2024,
        price_per_day: 950000.0,
        image_url: [
          "https://dummyimage.com/600x400/555/fff&text=Ioniq5+1",
          "https://dummyimage.com/600x400/ccc/000&text=Ioniq5+2",
        ],
        description:
          "Rasakan sensasi berkendara masa depan dengan SUV listrik ini. Hening, bertenaga, dan ramah lingkungan.",
        color: "Gravity Gold Matte",
      },
      {
        name: "Toyota Fortuner VRZ",
        type: Vehicle_Types.SUV,
        transmition: Transmission.AUTOMATIC,
        status: Vehicle_status.MAINTENANCE,
        fuel: Fuel.DEXLITE,
        brand: "Toyota",
        capacity: 7,
        kilometer: 65000,
        year: 2021,
        price_per_day: 800000.0,
        image_url: ["https://dummyimage.com/600x400/222/fff&text=Fortuner+1"],
        description:
          "SUV diesel mewah dan bertenaga, memberikan performa superior dan tampilan yang gagah di jalanan.",
        color: "Super White",
      },
      {
        name: "Honda HR-V SE",
        type: Vehicle_Types.SUV,
        transmition: Transmission.AUTOMATIC,
        status: Vehicle_status.AVAILABLE,
        fuel: Fuel.PERTAMAXTURBO,
        brand: "Honda",
        capacity: 5,
        kilometer: 22000,
        year: 2023,
        price_per_day: 550000.0,
        image_url: ["https://dummyimage.com/600x400/0000ff/fff&text=HRV+1"],
        description:
          "Compact SUV dengan desain elegan, kabin modern, dan pengalaman berkendara yang mulus.",
        color: "Sand Khaki Pearl",
      },
      {
        name: "Suzuki Ertiga Hybrid GX",
        type: Vehicle_Types.MPV,
        transmition: Transmission.MANUAL,
        status: Vehicle_status.AVAILABLE,
        fuel: Fuel.DEXLITE,
        brand: "Suzuki",
        capacity: 7,
        kilometer: 11000,
        year: 2024,
        price_per_day: 370000.0,
        image_url: [
          "https://dummyimage.com/600x400/808080/fff&text=Ertiga+Hybrid+1",
        ],
        description:
          "MPV hybrid efisien yang menawarkan konsumsi bahan bakar luar biasa tanpa mengorbankan ruang dan kenyamanan.",
        color: "Mellow Deep Red Pearl",
      },
      {
        name: "Wuling Air EV Long Range",
        type: Vehicle_Types.HATCHBACK,
        transmition: Transmission.AUTOMATIC,
        status: Vehicle_status.RENTED,
        fuel: Fuel.PERTALITE,
        brand: "Wuling",
        capacity: 4,
        kilometer: 9500,
        year: 2023,
        price_per_day: 300000.0,
        image_url: ["https://dummyimage.com/600x400/ffff00/000&text=AirEV+1"],
        description:
          "Mobil listrik perkotaan yang sempurna. Ringkas, mudah diparkir, dan ideal untuk perjalanan jarak pendek.",
        color: "Pristine White",
      },
      {
        name: "Toyota Camry V",
        type: Vehicle_Types.SEDAN,
        transmition: Transmission.AUTOMATIC,
        status: Vehicle_status.AVAILABLE,
        fuel: Fuel.PERTAMAXTURBO,
        brand: "Toyota",
        capacity: 5,
        kilometer: 38000,
        year: 2022,
        price_per_day: 750000.0,
        image_url: ["https://dummyimage.com/600x400/111/fff&text=Camry+1"],
        description:
          "Sedan premium yang menggabungkan kenyamanan, gaya, dan performa untuk pengalaman berkendara yang mewah.",
        color: "Attitude Black",
      },
      {
        name: "Toyota Raize GR Sport",
        type: Vehicle_Types.SUV,
        transmition: Transmission.AUTOMATIC,
        status: Vehicle_status.AVAILABLE,
        fuel: Fuel.PERTAMAXTURBO,
        brand: "Toyota",
        capacity: 5,
        kilometer: 21000,
        year: 2023,
        price_per_day: 420000.0,
        image_url: ["https://dummyimage.com/600x400/008080/fff&text=Raize+1"],
        description:
          "Compact SUV dengan mesin turbo yang memberikan pengalaman berkendara yang seru dan enerjik.",
        color: "Turquoise MM",
      },
      {
        name: "Daihatsu Sigra R",
        type: Vehicle_Types.MPV,
        transmition: Transmission.MANUAL,
        status: Vehicle_status.AVAILABLE,
        fuel: Fuel.PERTAMAXTURBO,
        brand: "Daihatsu",
        capacity: 7,
        kilometer: 52000,
        year: 2021,
        price_per_day: 290000.0,
        image_url: ["https://dummyimage.com/600x400/555555/fff&text=Sigra+1"],
        description:
          "LCGC 7-seater yang terjangkau dan praktis, pilihan tepat untuk keluarga hemat.",
        color: "Dark Grey Metallic",
      },
      {
        name: "Honda Civic RS",
        type: Vehicle_Types.SEDAN,
        transmition: Transmission.AUTOMATIC,
        status: Vehicle_status.MAINTENANCE,
        fuel: Fuel.PERTAMAXTURBO,
        brand: "Honda",
        capacity: 5,
        kilometer: 33000,
        year: 2022,
        price_per_day: 850000.0,
        image_url: [
          "https://dummyimage.com/600x400/ff4500/fff&text=Civic+RS+1",
        ],
        description:
          "Sedan sporty dengan mesin turbo, gaya agresif, dan serangkaian fitur teknologi modern.",
        color: "Ignite Red Metallic",
      },
      {
        name: "Toyota Alphard G",
        type: Vehicle_Types.MINIVAN,
        transmition: Transmission.AUTOMATIC,
        status: Vehicle_status.AVAILABLE,
        fuel: Fuel.PERTAMAXTURBO,
        brand: "Toyota",
        capacity: 7,
        kilometer: 40000,
        year: 2021,
        price_per_day: 1500000.0,
        image_url: ["https://dummyimage.com/600x400/f5f5dc/000&text=Alphard+1"],
        description:
          "Puncak kemewahan minivan. Menawarkan kenyamanan dan ruang tak tertandingi untuk perjalanan eksekutif atau VIP.",
        color: "Pearl White",
      },
      {
        name: "Mitsubishi Pajero Sport Dakar",
        type: Vehicle_Types.SUV,
        transmition: Transmission.AUTOMATIC,
        status: Vehicle_status.AVAILABLE,
        fuel: Fuel.PERTAMAXTURBO,
        brand: "Mitsubishi",
        capacity: 7,
        kilometer: 55000,
        year: 2021,
        price_per_day: 850000.0,
        image_url: [
          "https://dummyimage.com/600x400/c0c0c0/000&text=Pajero+Sport+1",
        ],
        description:
          "SUV premium 7-seater dengan mesin diesel bertenaga dan sistem 4WD canggih untuk kemampuan off-road superior.",
        color: "Sterling Silver Metallic",
      },
    ];

    const promosData = [
      {
        code: "LIBURANASIK25",
        description:
          "Diskon 25% untuk semua pemesanan kendaraan selama libur sekolah. Jadikan liburan lebih seru!",
        discount_value: 25,
        start_date: new Date("2025-06-15T00:00:00Z"),
        end_date: new Date("2025-07-15T23:59:59Z"),
        min_booking_amount: 500000.0,
        status: true,
      },
      {
        code: "JOGJAIstimewa",
        description:
          "Potongan harga Rp 75.000 untuk rental mobil di area Yogyakarta. Jelajahi Jogja tanpa batas!",
        discount_value: 10, // Assuming a 10% discount for consistency, though description implies fixed amount
        start_date: new Date("2025-06-01T00:00:00Z"),
        end_date: new Date("2025-06-30T23:59:59Z"),
        min_booking_amount: 400000.0,
        status: true,
      },
      {
        code: "WEEKENDSERU",
        description:
          "Nikmati diskon 15% untuk semua pemesanan di akhir pekan (Jumat-Minggu).",
        discount_value: 15,
        start_date: new Date("2025-05-01T00:00:00Z"),
        end_date: new Date("2025-08-31T23:59:59Z"),
        min_booking_amount: 350000.0,
        status: true,
      },
      {
        code: "BALIBESTDEAL",
        description:
          "Diskon hingga Rp 200.000 untuk paket akomodasi dan kendaraan di Bali. Pesan sekarang!",
        discount_value: 20,
        start_date: new Date("2025-06-10T00:00:00Z"),
        end_date: new Date("2025-07-10T23:59:59Z"),
        min_booking_amount: 1500000.0,
        status: true,
      },
      {
        code: "HEMAT10",
        description:
          "Gunakan kode ini untuk mendapatkan potongan 10% untuk pemesanan pertama Anda.",
        discount_value: 10,
        start_date: new Date("2025-01-01T00:00:00Z"),
        end_date: new Date("2025-12-31T23:59:59Z"),
        min_booking_amount: 250000.0,
        status: true,
      },
      {
        code: "FLASHSALE66",
        description:
          "Flash Sale! Diskon spesial 30% hanya berlaku 3 hari. Jangan sampai ketinggalan!",
        discount_value: 30,
        start_date: new Date("2025-06-06T00:00:00Z"),
        end_date: new Date("2025-06-08T23:59:59Z"),
        min_booking_amount: 700000.0,
        status: false, // This promo is already expired
      },
      {
        code: "PAYDAYFEST",
        description:
          "Promo gajian! Diskon 18% untuk semua produk. Berlaku di akhir bulan.",
        discount_value: 18,
        start_date: new Date("2025-06-25T00:00:00Z"),
        end_date: new Date("2025-07-02T23:59:59Z"),
        min_booking_amount: 800000.0,
        status: true, // This promo is upcoming
      },
      {
        code: "MUDIKLEBARAN",
        description:
          "Promo spesial mudik Lebaran. Diskon untuk pemesanan jangka panjang.",
        discount_value: 20,
        start_date: new Date("2026-03-10T00:00:00Z"), // Example for next year's Lebaran
        end_date: new Date("2026-04-10T23:59:59Z"),
        min_booking_amount: 2500000.0,
        status: true, // For future use
      },
      {
        code: "NONAKTIF01",
        description:
          "Contoh promo yang sudah tidak aktif dan tidak akan ditampilkan.",
        discount_value: 50,
        start_date: new Date("2025-01-01T00:00:00Z"),
        end_date: new Date("2025-01-31T23:59:59Z"),
        min_booking_amount: 100000.0,
        status: false,
      },
      {
        code: "LONGSTAYDEAL",
        description:
          "Sewa lebih dari 7 hari dan dapatkan diskon 22%. Cocok untuk liburan panjang atau perjalanan dinas.",
        discount_value: 22,
        start_date: new Date("2025-02-01T00:00:00Z"),
        end_date: new Date("2025-12-31T23:59:59Z"),
        min_booking_amount: 3000000.0,
        status: true,
      },
    ];

    console.log("Start seeding promos...");
    for (const p of promosData) {
      await prisma.promos.create({
        data: p,
      });
    }
    console.log("Finished seeding promos.");
    console.log("Start seeding vehicles...");
    for (const v of vehiclesData) {
      await prisma.vehicles.create({
        data: v,
      });
    }
    console.log("Finished seeding vehicles.");

    console.log(`Starting to seed ${destinations.length} destinations...`);
    for (const destinationData of destinations) {
      try {
        await prisma.destinations.upsert({
          where: { id: destinationData.id },
          update: {
            name: destinationData.name,
            open_hour: destinationData.open_hour,
            description: destinationData.description,
            image_urls: destinationData.image_urls,
            address: destinationData.address,
            category: destinationData.category,
            facilities: destinationData.facilities,
            status: destinationData.status,
            created_at: new Date(destinationData.created_at),
            updated_at: new Date(destinationData.updated_at),
            deleted_at: destinationData.deleted_at
              ? new Date(destinationData.deleted_at)
              : null,
          },
          create: {
            id: destinationData.id,
            name: destinationData.name,
            open_hour: destinationData.open_hour,
            description: destinationData.description,
            image_urls: destinationData.image_urls,
            address: destinationData.address,
            category: destinationData.category,
            facilities: destinationData.facilities,
            status: destinationData.status,
            created_at: new Date(destinationData.created_at),
            updated_at: new Date(destinationData.updated_at),
            deleted_at: destinationData.deleted_at
              ? new Date(destinationData.deleted_at)
              : null,
          },
        });
        console.log(
          `Seeded destination: ${destinationData.name} (${destinationData.id})`
        );
      } catch (innerError) {
        if (innerError instanceof PrismaClientKnownRequestError) {
          console.error(
            `Error seeding destination ${destinationData.name} (${destinationData.id}):`,
            innerError.message
          );
        } else {
          console.error(
            `Unexpected error seeding destination ${destinationData.name} (${destinationData.id}):`,
            innerError
          );
        }
      }
    }
    console.log("Successfully seeded all destinations.");

    console.log("Starting to seed ratings...");
    for (const customer of customers) {
      const shuffledDestinations = [...destinations].sort(
        () => 0.5 - Math.random()
      );
      const destinationsToRate = shuffledDestinations.slice(0, 5);

      for (const destination of destinationsToRate) {
        try {
          await prisma.rating.create({
            data: {
              userId: customer.id,
              ratedType: RatedEntityType.DESTINATION,
              targetId: destination.id,
              ratingValue: Math.floor(Math.random() * 5) + 1,
              comment: `This is a great place! I really enjoyed my time at ${destination.name}.`,
              status: true,
            },
          });
          console.log(
            `Seeded rating from ${customer.email} for ${destination.name}`
          );
        } catch (innerError) {
          if (
            innerError instanceof PrismaClientKnownRequestError &&
            innerError.code === "P2002"
          ) {
            console.warn(
              `Rating already exists for user ${customer.email} and destination ${destination.name}. Skipping.`
            );
          } else {
            console.error(
              `Error seeding rating from ${customer.email} for ${destination.name}:`,
              innerError
            );
          }
        }
      }
    }
    console.log("Successfully seeded all ratings.");

    console.log("Successfully seeded accommodations.");
    for (const acc of accommodationsData) {
      await prisma.accommodations.create({
        data: acc,
      });
    }
    console.log("Finished seeding accommodations.");
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error("Prisma Client Known Request Error in main:", error);
    } else {
      console.error("An unexpected error occurred in main:", error);
    }
  } finally {
    await prisma.$disconnect();
    console.log("Prisma client disconnected.");
  }
}

main().catch((error) => {
  console.error("Failed to seed database:");
  console.error(error);
  process.exit(1);
});
