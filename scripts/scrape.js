const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const founders = [
  // Portulans Institute
  {
    name: 'Carolina A. ROSSINI',
    linkedin: 'https://www.linkedin.com/in/carolinarossini/',
    photoId: 'carolina-rossini',
    org: 'portulans'
  },
  {
    name: 'Bill DUTTON',
    linkedin: 'https://www.linkedin.com/in/william-dutton-1755772/',
    photoId: 'bill-dutton',
    org: 'portulans'
  },
  {
    name: 'Elizaveta CHERNENKO',
    linkedin: 'https://www.linkedin.com/in/elizaveta-chernenko/',
    photoId: 'elizaveta-chernenko',
    org: 'portulans'
  },
  // Research ICT Africa
  {
    name: 'Alison GILLWALD',
    linkedin: 'https://www.linkedin.com/in/alison-gillwald-6183b114/',
    photoId: 'alison-gillwald',
    org: 'research-ict-africa'
  },
  {
    name: 'Liz OREMBO',
    linkedin: 'https://www.linkedin.com/in/lizorembo/',
    photoId: 'liz-orembo',
    org: 'research-ict-africa'
  },
  // OBSERVACOM
  {
    name: 'Bruce GIRARD',
    linkedin: 'https://www.linkedin.com/in/brucegirard/',
    photoId: 'bruce-girard',
    org: 'observacom'
  },
  {
    name: 'Gustavo GÓMEZ',
    linkedin: 'https://www.linkedin.com/in/gusgomez/',
    photoId: 'gustavo-gomez',
    org: 'observacom'
  },
  // Fair Change
  {
    name: 'Merrin Mohammed ASHRAF',
    linkedin: 'https://www.linkedin.com/in/merrin-ashraf/',
    photoId: 'merrin-ashraf',
    org: 'fair-change'
  },
  {
    name: 'Anita GURUMURTHY',
    linkedin: 'https://www.linkedin.com/in/anita-gurumurthy/',
    photoId: 'anita-gurumurthy',
    org: 'fair-change'
  },
  // TESaCo
  {
    name: 'Serena CIRANNA',
    linkedin: 'https://www.linkedin.com/in/serenaciranna/',
    photoId: 'serena-ciranna',
    org: 'tesaco'
  },
  {
    name: 'Daniel ANDLER',
    linkedin: 'https://www.linkedin.com/in/daniel-andler/',
    photoId: 'daniel-andler',
    org: 'tesaco'
  },
  // Digital Rights Foundation
  {
    name: 'Seerat KHAN',
    linkedin: 'https://www.linkedin.com/in/seeratkhan/',
    photoId: 'seerat-khan',
    org: 'digital-rights'
  },
  {
    name: 'Nighat DAD',
    linkedin: 'https://www.linkedin.com/in/nighatdad/',
    photoId: 'nighat-dad',
    org: 'digital-rights'
  },
  // Global Partners Digital
  {
    name: 'Ian BARBER',
    linkedin: 'https://www.linkedin.com/in/ianbarber/',
    photoId: 'ian-barber',
    org: 'global-partners'
  },
  {
    name: 'Maria Paz CANALES',
    linkedin: 'https://www.linkedin.com/in/mariapazcanales/',
    photoId: 'maria-paz-canales',
    org: 'global-partners'
  }
  
    // InternetLab
    {
      name: 'Iná JOST',
      linkedin: 'https://www.linkedin.com/in/inajost/',
      photoId: 'ina-jost',
      org: 'internetlab'
    },
    {
      name: 'Fernanda K. MARTINS',
      linkedin: 'https://www.linkedin.com/in/fernandakmartins/',
      photoId: 'fernanda-martins',
      org: 'internetlab'
    },
    // RadicalChange
    {
      name: 'Christophe GAUTHIER',
      linkedin: 'https://www.linkedin.com/in/christophegauthier/',
      photoId: 'christophe-gauthier',
      org: 'radical-change'
    },
    {
      name: 'Mathias DUFOUR',
      linkedin: 'https://www.linkedin.com/in/mathiasdufour/',
      photoId: 'mathias-dufour',
      org: 'radical-change'
    },
    // IAMCR
    {
      name: 'Jeremy SHTERN',
      linkedin: 'https://www.linkedin.com/in/jeremy-shtern/',
      photoId: 'jeremy-shtern',
      org: 'iamcr'
    },
    {
      name: 'Frits BUSSEMAKER',
      linkedin: 'https://www.linkedin.com/in/fritsbussemaker/',
      photoId: 'frits-bussemaker',
      org: 'iamcr'
    },
    // Innovation for Policy
    {
      name: 'Jon STEVER',
      linkedin: 'https://www.linkedin.com/in/jonstever/',
      photoId: 'jon-stever',
      org: 'innovation-policy'
    },
    {
      name: 'Arnya HAMILTON',
      linkedin: 'https://www.linkedin.com/in/arnyahamilton/',
      photoId: 'arnya-hamilton',
      org: 'innovation-policy'
    },
    // Autres organisations
    {
      name: 'Nubert BOUBEKA',
      linkedin: 'https://www.linkedin.com/in/nubertboubeka/',
      photoId: 'nubert-boubeka',
      org: 'various-1'
    },
    {
      name: 'Ingrid VOLKMER',
      linkedin: 'https://www.linkedin.com/in/ingridvolkmer/',
      photoId: 'ingrid-volkmer',
      org: 'various-1'
    },
    {
      name: 'Ramon TUAZON',
      linkedin: 'https://www.linkedin.com/in/ramontuazon/',
      photoId: 'ramon-tuazon',
      org: 'various-1'
    },
    {
      name: 'Amrita SENGUPTA',
      linkedin: 'https://www.linkedin.com/in/amritasengupta/',
      photoId: 'amrita-sengupta',
      org: 'various-2'
    },
    {
      name: 'Armando GUIO',
      linkedin: 'https://www.linkedin.com/in/armandoguio/',
      photoId: 'armando-guio',
      org: 'various-2'
    },
    {
      name: 'Roger LATCHMAN',
      linkedin: 'https://www.linkedin.com/in/rogerlatchman/',
      photoId: 'roger-latchman',
      org: 'various-2'
    }
  ];


const organizations = [
  {
    name: 'Portulans Institute',
    id: 'portulans',
    website: 'https://portulansinstitute.org'
  },
  {
    name: 'Research ICT Africa',
    id: 'research-ict-africa',
    website: 'https://researchictafrica.net'
  },
  {
    name: 'OBSERVACOM',
    id: 'observacom',
    website: 'https://www.observacom.org'
  },
  {
    name: 'Fair Change',
    id: 'fair-change',
    website: 'https://fairchange.org'
  },
  {
    name: 'TESaCo',
    id: 'tesaco',
    website: 'https://tesaco.org'
  },
  {
    name: 'Digital Rights Foundation',
    id: 'digital-rights',
    website: 'https://digitalrightsfoundation.pk'
  },
  {
    name: 'Global Partners Digital',
    id: 'global-partners',
    website: 'https://www.gp-digital.org'
  }

    {
      name: 'InternetLab',
      id: 'internetlab',
      website: 'https://www.internetlab.org'
    },
    {
      name: 'RadicalChange',
      id: 'radical-change',
      website: 'https://radicalchange.com'
    },
    {
      name: 'IAMCR',
      id: 'iamcr',
      website: 'https://iamcr.org'
    },
    {
      name: 'Innovation for Policy Foundation',
      id: 'innovation-policy',
      website: 'https://innovationpolicy.org'
    }
  ];

async function downloadImage(url, filename) {
  try {
    const response = await axios({
      url,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    await fs.writeFile(filename, response.data);
    console.log(`Downloaded: ${filename}`);
  } catch (error) {
    console.error(`Error downloading ${filename}:`, error.message);
  }
}

async function main() {
  await fs.mkdir('public/assets/founders/photos', { recursive: true });
  await fs.mkdir('public/assets/founders/logos', { recursive: true });

  for (const founder of founders) {
    const filename = path.join('public/assets/founders/photos', `${founder.photoId}.jpg`);
    console.log(`\nPhoto needed for ${founder.name}:`);
    console.log(`LinkedIn: ${founder.linkedin}`);
    console.log(`Save as: ${filename}`);
  }

  console.log('\n--- Organization Logos ---');
  for (const org of organizations) {
    const filename = path.join('public/assets/founders/logos', `${org.id}.png`);
    console.log(`\nLogo needed for ${org.name}:`);
    console.log(`Website: ${org.website}`);
    console.log(`Save as: ${filename}`);
  }
}

main().catch(console.error);