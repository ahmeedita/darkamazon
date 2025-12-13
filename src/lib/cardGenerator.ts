// Seeded random number generator for consistent daily randomization
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Get seed based on current date (changes every 24 hours)
function getDailySeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

// Bank data by region
const banksByRegion = {
  'United States': [
    'Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank', 'JP Morgan',
    'Goldman Sachs', 'Morgan Stanley', 'Capital One', 'PNC Bank', 'U.S. Bank',
    'Truist Bank', 'TD Bank USA', 'Fifth Third Bank', 'KeyBank', 'Regions Bank',
    'M&T Bank', 'Citizens Bank', 'Huntington Bank', 'Ally Bank', 'Discover Bank'
  ],
  'United Kingdom': [
    'Barclays', 'HSBC UK', 'Lloyds Banking', 'NatWest', 'Santander UK',
    'Standard Chartered', 'Halifax', 'TSB Bank', 'Nationwide', 'Metro Bank',
    'Monzo', 'Starling Bank', 'Revolut', 'Virgin Money', 'Co-operative Bank'
  ],
  'Germany': [
    'Deutsche Bank', 'Commerzbank', 'DZ Bank', 'KfW', 'UniCredit Germany',
    'Postbank', 'HypoVereinsbank', 'Landesbank', 'Sparkasse', 'N26'
  ],
  'France': [
    'BNP Paribas', 'Crédit Agricole', 'Société Générale', 'BPCE', 'Crédit Mutuel',
    'La Banque Postale', 'CIC', 'LCL', 'Boursorama', 'Hello Bank'
  ],
  'Switzerland': [
    'UBS', 'Credit Suisse', 'Julius Baer', 'Pictet', 'Lombard Odier',
    'Vontobel', 'Zürcher Kantonalbank', 'Raiffeisen Switzerland'
  ],
  'Canada': [
    'Royal Bank', 'TD Bank', 'Bank of Montreal', 'Scotiabank', 'CIBC',
    'National Bank', 'Desjardins', 'HSBC Canada', 'Tangerine', 'Simplii'
  ],
  'Netherlands': [
    'ING Bank', 'Rabobank', 'ABN AMRO', 'de Volksbank', 'Triodos Bank',
    'Bunq', 'Knab', 'ASN Bank'
  ],
  'Spain': [
    'Santander', 'BBVA', 'CaixaBank', 'Sabadell', 'Bankinter',
    'Unicaja', 'Ibercaja', 'Kutxabank'
  ],
  'Italy': [
    'UniCredit', 'Intesa Sanpaolo', 'Banco BPM', 'Monte dei Paschi',
    'BPER Banca', 'Mediobanca', 'Credem', 'Banca Mediolanum'
  ],
  'Australia': [
    'Commonwealth Bank', 'Westpac', 'NAB', 'ANZ', 'Macquarie Bank',
    'ING Australia', 'Bendigo Bank', 'Suncorp'
  ]
};

const currencies: Record<string, { symbol: string; code: string }> = {
  'United States': { symbol: '$', code: 'USD' },
  'United Kingdom': { symbol: '£', code: 'GBP' },
  'Germany': { symbol: '€', code: 'EUR' },
  'France': { symbol: '€', code: 'EUR' },
  'Switzerland': { symbol: 'CHF ', code: 'CHF' },
  'Canada': { symbol: 'CAD $', code: 'CAD' },
  'Netherlands': { symbol: '€', code: 'EUR' },
  'Spain': { symbol: '€', code: 'EUR' },
  'Italy': { symbol: '€', code: 'EUR' },
  'Australia': { symbol: 'A$', code: 'AUD' }
};

// BIN prefixes by card network
const binPrefixes = {
  visa: ['4532', '4556', '4916', '4539', '4485', '4716', '4929', '4024', '4556', '4111'],
  mastercard: ['5555', '5454', '5105', '5425', '5431', '5500', '5115', '5293', '5232', '5281'],
  amex: ['3782', '3714', '3787', '3764', '3742', '3759', '3727', '3778']
};

function shuffle<T>(array: T[], random: () => number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function randomFromArray<T>(array: T[], random: () => number): T {
  return array[Math.floor(random() * array.length)];
}

function randomInRange(min: number, max: number, random: () => number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

function formatBalance(amount: number, currency: { symbol: string }): string {
  return `${currency.symbol}${amount.toLocaleString()}`;
}

function generateBIN(random: () => number): string {
  const networks = ['visa', 'visa', 'visa', 'mastercard', 'mastercard', 'amex'];
  const network = randomFromArray(networks, random) as keyof typeof binPrefixes;
  const prefix = randomFromArray(binPrefixes[network], random);
  const suffix = randomInRange(10, 99, random);
  return `${prefix} ${suffix}** **** ****`;
}

function generateExpiry(random: () => number): { month: string; year: string } {
  const month = randomInRange(1, 12, random).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear();
  const year = (currentYear + randomInRange(1, 4, random)).toString().slice(-2);
  return { month, year };
}

interface GeneratedCard {
  id: string;
  bin: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  bank: string;
  country: string;
  balance: string;
  price: number;
  successRate: number;
  tier: 'premium' | 'standard' | 'basic';
}

function generateCard(
  id: string,
  tier: 'premium' | 'standard' | 'basic',
  random: () => number
): GeneratedCard {
  const countries = Object.keys(banksByRegion);
  const country = randomFromArray(countries, random);
  const bank = randomFromArray(banksByRegion[country as keyof typeof banksByRegion], random);
  const currency = currencies[country];
  const expiry = generateExpiry(random);
  
  let balanceRange: { min: number; max: number };
  let price: number;
  let successRate: number;
  
  switch (tier) {
    case 'premium':
      balanceRange = { min: 10000, max: 20000 };
      price = 50;
      successRate = 98;
      break;
    case 'standard':
      balanceRange = { min: 2000, max: 9000 };
      price = 40;
      successRate = 85;
      break;
    case 'basic':
      balanceRange = { min: 500, max: 1900 };
      price = 29.99;
      successRate = 70;
      break;
  }
  
  const balance = randomInRange(balanceRange.min, balanceRange.max, random);
  
  return {
    id,
    bin: generateBIN(random),
    expiryMonth: expiry.month,
    expiryYear: expiry.year,
    cvv: '***',
    bank,
    country,
    balance: formatBalance(balance, currency),
    price,
    successRate,
    tier
  };
}

// Storage key for reserved cards
const RESERVED_CARDS_KEY = 'darkAmazon_reservedCards';

interface ReservedCard {
  cardId: string;
  orderId: string;
  expiresAt: number;
}

function getReservedCards(): ReservedCard[] {
  const stored = localStorage.getItem(RESERVED_CARDS_KEY);
  if (!stored) return [];
  
  const cards: ReservedCard[] = JSON.parse(stored);
  const now = Date.now();
  
  // Filter out expired reservations
  const validCards = cards.filter(c => c.expiresAt > now);
  
  // Update storage if we filtered any
  if (validCards.length !== cards.length) {
    localStorage.setItem(RESERVED_CARDS_KEY, JSON.stringify(validCards));
  }
  
  return validCards;
}

export function reserveCards(cardIds: string[], orderId: string): void {
  const reservedCards = getReservedCards();
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  
  const newReservations: ReservedCard[] = cardIds.map(cardId => ({
    cardId,
    orderId,
    expiresAt
  }));
  
  const updated = [...reservedCards, ...newReservations];
  localStorage.setItem(RESERVED_CARDS_KEY, JSON.stringify(updated));
}

export function releaseCards(orderId: string): void {
  const reservedCards = getReservedCards();
  const filtered = reservedCards.filter(c => c.orderId !== orderId);
  localStorage.setItem(RESERVED_CARDS_KEY, JSON.stringify(filtered));
  // Dispatch event to trigger immediate UI refresh
  window.dispatchEvent(new CustomEvent('cardsReleased'));
}

export function isCardReserved(cardId: string): boolean {
  const reservedCards = getReservedCards();
  return reservedCards.some(c => c.cardId === cardId);
}

export function generateDailyCards(): GeneratedCard[] {
  const seed = getDailySeed();
  const random = seededRandom(seed);
  
  const cards: GeneratedCard[] = [];
  
  // Generate 22 premium cards
  for (let i = 1; i <= 22; i++) {
    cards.push(generateCard(`premium-${i}`, 'premium', random));
  }
  
  // Generate 20 standard cards
  for (let i = 1; i <= 20; i++) {
    cards.push(generateCard(`standard-${i}`, 'standard', random));
  }
  
  // Generate 25 basic cards
  for (let i = 1; i <= 25; i++) {
    cards.push(generateCard(`basic-${i}`, 'basic', random));
  }
  
  // Shuffle all cards together
  return shuffle(cards, random);
}

export function getAvailableCards(): GeneratedCard[] {
  const allCards = generateDailyCards();
  return allCards.filter(card => !isCardReserved(card.id));
}

export function getCardsByTier(tier: 'premium' | 'standard' | 'basic'): GeneratedCard[] {
  return getAvailableCards().filter(card => card.tier === tier);
}
