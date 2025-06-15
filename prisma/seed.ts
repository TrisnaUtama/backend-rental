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
      "passwordadmin@ex.com",
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
