export interface BrandSignature {
  brand: string;
  category: 'Tech' | 'Social' | 'Commerce' | 'Finance' | 'Logistics' | 'Crypto' | 'Telecom' | 'Developer' | 'Gaming' | 'Government';
  officialDomains: string[];
  tokens: string[];
  contentKeywords: string[];
}

export const BRAND_INTELLIGENCE_DB: BrandSignature[] = [
  {
    brand: 'Google',
    category: 'Tech',
    officialDomains: ['google.com', 'accounts.google.com', 'gmail.com', 'youtube.com', 'workspace.google.com'],
    tokens: ['google', 'gmail', 'googledrive', 'googleaccount'],
    contentKeywords: ['sign in with google', 'google account', 'gmail', 'google workspace'],
  },
  {
    brand: 'Microsoft',
    category: 'Tech',
    officialDomains: ['microsoft.com', 'login.microsoftonline.com', 'live.com', 'outlook.com', 'office.com', 'onedrive.live.com'],
    tokens: ['microsoft', 'office365', 'outlook', 'onedrive', 'sharepoint', 'micros0ft'],
    contentKeywords: ['microsoft account', 'office 365', 'microsoft 365', 'outlook web', 'onedrive'],
  },
  {
    brand: 'Apple',
    category: 'Tech',
    officialDomains: ['apple.com', 'icloud.com', 'appleid.apple.com'],
    tokens: ['appleid', 'icloud', 'apple-support', 'itunes', 'app1e'],
    contentKeywords: ['apple id', 'icloud', 'apple account', 'find my iphone'],
  },
  {
    brand: 'Yahoo Mail',
    category: 'Tech',
    officialDomains: ['yahoo.com', 'mail.yahoo.com'],
    tokens: ['yahoomail', 'yahoo-login', 'yhaoo'],
    contentKeywords: ['yahoo mail', 'sign in to yahoo'],
  },
  {
    brand: 'Proton Mail',
    category: 'Tech',
    officialDomains: ['proton.me', 'protonmail.com'],
    tokens: ['protonmail', 'proton-verify'],
    contentKeywords: ['proton mail', 'proton account'],
  },
  {
    brand: 'Meta / Facebook',
    category: 'Social',
    officialDomains: ['meta.com', 'facebook.com', 'fb.com', 'messenger.com'],
    tokens: ['facebook', 'meta-security', 'fb-verify', 'messenger', 'faceb00k'],
    contentKeywords: ['facebook', 'meta business', 'meta account', 'facebook security'],
  },
  {
    brand: 'Instagram',
    category: 'Social',
    officialDomains: ['instagram.com'],
    tokens: ['instagram', 'instagrarn', 'ig-verify'],
    contentKeywords: ['instagram', 'verified badge', 'instagram copyright'],
  },
  {
    brand: 'WhatsApp',
    category: 'Social',
    officialDomains: ['whatsapp.com'],
    tokens: ['whatsapp', 'whatsap', 'whats-app'],
    contentKeywords: ['whatsapp web', 'whatsapp verification'],
  },
  {
    brand: 'Discord',
    category: 'Social',
    officialDomains: ['discord.com', 'discord.gg', 'discordapp.com'],
    tokens: ['discord', 'dlscord', 'discord-nitro', 'discordapp'],
    contentKeywords: ['discord nitro', 'claim discord', 'discord login'],
  },
  {
    brand: 'X / Twitter',
    category: 'Social',
    officialDomains: ['x.com', 'twitter.com'],
    tokens: ['twitter', 'tw1tter'],
    contentKeywords: ['sign in to x', 'twitter account'],
  },
  {
    brand: 'LinkedIn',
    category: 'Social',
    officialDomains: ['linkedin.com'],
    tokens: ['linkedin', '1inkedin'],
    contentKeywords: ['linkedin', 'linkedin account'],
  },
  {
    brand: 'GitHub',
    category: 'Developer',
    officialDomains: ['github.com'],
    tokens: ['github', 'githuh'],
    contentKeywords: ['sign in to github', 'github personal access'],
  },
  {
    brand: 'PayPal',
    category: 'Finance',
    officialDomains: ['paypal.com'],
    tokens: ['paypal', 'paypa1', 'pp-secure'],
    contentKeywords: ['paypal', 'paypal account', 'paypal resolution center'],
  },
  {
    brand: 'Amazon',
    category: 'Commerce',
    officialDomains: ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.ae', 'amazon.sa', 'aws.amazon.com'],
    tokens: ['amazon', 'amzn', 'aws-login', 'arnazon'],
    contentKeywords: ['amazon prime', 'amazon account', 'aws management console'],
  },
  {
    brand: 'eBay',
    category: 'Commerce',
    officialDomains: ['ebay.com', 'ebay.co.uk'],
    tokens: ['ebay-secure', 'ebay-verify'],
    contentKeywords: ['ebay account', 'ebay resolution'],
  },
  {
    brand: 'Shopify',
    category: 'Commerce',
    officialDomains: ['shopify.com', 'myshopify.com'],
    tokens: ['shopify-support', 'shopify-verify'],
    contentKeywords: ['shopify admin', 'shopify store verification'],
  },
  {
    brand: 'Netflix',
    category: 'Commerce',
    officialDomains: ['netflix.com'],
    tokens: ['netflix', 'netfiix', 'netf1ix'],
    contentKeywords: ['netflix', 'netflix membership', 'restart your membership'],
  },
  {
    brand: 'Spotify',
    category: 'Commerce',
    officialDomains: ['spotify.com'],
    tokens: ['spotify', 'sp0tify'],
    contentKeywords: ['spotify', 'spotify premium'],
  },
  {
    brand: 'Steam',
    category: 'Gaming',
    officialDomains: ['steampowered.com', 'steamcommunity.com'],
    tokens: ['steampowered', 'steamcommunity', 'stearn'],
    contentKeywords: ['steam guard', 'steam community', 'steam account'],
  },
  {
    brand: 'Roblox',
    category: 'Gaming',
    officialDomains: ['roblox.com'],
    tokens: ['roblox', 'r0blox', 'robux-free'],
    contentKeywords: ['roblox account', 'free robux'],
  },
  {
    brand: 'Epic Games',
    category: 'Gaming',
    officialDomains: ['epicgames.com'],
    tokens: ['epicgames', 'epic-games-gift'],
    contentKeywords: ['epic games account', 'fortnite vbucks'],
  },
  {
    brand: 'PlayStation',
    category: 'Gaming',
    officialDomains: ['playstation.com', 'sonyentertainmentnetwork.com'],
    tokens: ['playstation', 'psn-login'],
    contentKeywords: ['playstation network', 'psn sign in'],
  },
  {
    brand: 'Stripe',
    category: 'Finance',
    officialDomains: ['stripe.com'],
    tokens: ['stripe'],
    contentKeywords: ['stripe dashboard', 'stripe payout'],
  },
  {
    brand: 'Visa / Mastercard',
    category: 'Finance',
    officialDomains: ['visa.com', 'mastercard.com'],
    tokens: ['visa-verify', 'mastercard-secure'],
    contentKeywords: ['verified by visa', 'mastercard securecode'],
  },
  {
    brand: 'Binance',
    category: 'Crypto',
    officialDomains: ['binance.com', 'binance.us'],
    tokens: ['binance', 'binnance'],
    contentKeywords: ['binance', 'binance wallet'],
  },
  {
    brand: 'Coinbase',
    category: 'Crypto',
    officialDomains: ['coinbase.com'],
    tokens: ['coinbase', 'c0inbase'],
    contentKeywords: ['coinbase wallet', 'coinbase account'],
  },
  {
    brand: 'MetaMask',
    category: 'Crypto',
    officialDomains: ['metamask.io'],
    tokens: ['metamask', 'metarnask'],
    contentKeywords: ['metamask', 'secret recovery phrase'],
  },
  {
    brand: 'Ledger / Trust Wallet',
    category: 'Crypto',
    officialDomains: ['ledger.com', 'trustwallet.com'],
    tokens: ['ledgerlive', 'ledger-sync', 'trustwallet', 'trust-wallet'],
    contentKeywords: ['ledger live', 'trust wallet', 'recovery seed'],
  },
  {
    brand: 'DHL',
    category: 'Logistics',
    officialDomains: ['dhl.com'],
    tokens: ['dhl', 'dhl-express', 'dhl-parcel'],
    contentKeywords: ['dhl express', 'dhl tracking', 'dhl delivery'],
  },
  {
    brand: 'FedEx',
    category: 'Logistics',
    officialDomains: ['fedex.com'],
    tokens: ['fedex'],
    contentKeywords: ['fedex tracking', 'fedex delivery'],
  },
  {
    brand: 'UPS',
    category: 'Logistics',
    officialDomains: ['ups.com'],
    tokens: ['ups-delivery', 'ups-tracking'],
    contentKeywords: ['ups tracking', 'ups delivery'],
  },
  {
    brand: 'Aramex',
    category: 'Logistics',
    officialDomains: ['aramex.com'],
    tokens: ['aramex'],
    contentKeywords: ['aramex tracking', 'aramex shipment'],
  },
  {
    brand: 'Al Rajhi Bank',
    category: 'Finance',
    officialDomains: ['alrajhibank.com.sa'],
    tokens: ['alrajhi', 'alrajhibank'],
    contentKeywords: ['al rajhi', 'alrajhi bank', 'مصرف الراجحي', 'الراجحي'],
  },
  {
    brand: 'SNB / AlAhli',
    category: 'Finance',
    officialDomains: ['alahli.com'],
    tokens: ['alahli', 'snb-alahli'],
    contentKeywords: ['saudi national bank', 'البنك الأهلي السعودي'],
  },
  {
    brand: 'STC / stc pay',
    category: 'Telecom',
    officialDomains: ['stc.com.sa', 'stcpay.com.sa'],
    tokens: ['stcpay', 'mystc'],
    contentKeywords: ['stc pay', 'mystc', 'اس تي سي باي'],
  },
  {
    brand: 'National Bank of Egypt / CIB',
    category: 'Finance',
    officialDomains: ['nbe.com.eg', 'cibeg.com'],
    tokens: ['nbe-egypt', 'alahlynet', 'cib-egypt'],
    contentKeywords: ['national bank of egypt', 'البنك الأهلي المصري', 'البنك التجاري الدولي'],
  },
  {
    brand: 'Vodafone / Orange / Etisalat',
    category: 'Telecom',
    officialDomains: ['vodafone.com', 'vodafone.com.eg', 'orange.eg', 'etisalat.ae', 'eand.com'],
    tokens: ['vodafone-cash', 'vodaf0ne', 'etisalat-bill'],
    contentKeywords: ['vodafone cash', 'فودافون كاش', 'etisalat'],
  },
  {
    brand: 'Government e-Services (Absher / IRS / GOV.UK)',
    category: 'Government',
    officialDomains: ['absher.sa', 'my.gov.sa', 'irs.gov', 'gov.uk', 'digital.gov.eg'],
    tokens: ['absher-verify', 'gov-tax-refund', 'irs-refund'],
    contentKeywords: ['absher login', 'منصة أبشر', 'tax refund claim', 'gov.uk verify'],
  },
  {
    brand: 'Cloudflare',
    category: 'Developer',
    officialDomains: ['cloudflare.com'],
    tokens: ['cloudflare', 'c1oudflare'],
    contentKeywords: ['verify you are human', 'cloudflare ray id'],
  },
];

export function normalizeLeetHomoglyphs(input: string): string {
  return input
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/rn/g, 'm')
    .replace(/vv/g, 'w')
    .replace(/cl/g, 'd');
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

export interface BrandImpersonationMatch {
  brand: string;
  officialDomain: string;
  confidence: number;
  evidence: string[];
}

export function detectBrandImpersonation(params: {
  fullHost: string;
  registrableDomain: string;
  pageTitle: string;
  visibleTextSample: string;
  hasCredentialFields: boolean;
}): BrandImpersonationMatch | undefined {
  const hostLower = params.fullHost.toLowerCase();
  const regLower = params.registrableDomain.toLowerCase();
  const domainLabel = regLower.split('.')[0] || '';
  const normalizedLabel = normalizeLeetHomoglyphs(domainLabel);
  const titleLower = params.pageTitle.toLowerCase();
  const textLower = params.visibleTextSample.toLowerCase();

  for (const sig of BRAND_INTELLIGENCE_DB) {
    const isOfficial = sig.officialDomains.some(
      (official) => regLower === official || hostLower.endsWith(`.${official}`)
    );
    if (isOfficial) continue;

    const evidence: string[] = [];

    // 1. Subdomain / hostname token trick
    for (const tok of sig.tokens) {
      if (hostLower.includes(tok)) {
        evidence.push(
          `Hostname "${hostLower}" embeds brand token "${tok}" outside official domain ${sig.officialDomains[0]}`
        );
      }
    }

    // 2. Typosquatting / homoglyph similarity on registrable domain label
    for (const official of sig.officialDomains) {
      const offLabel = official.split('.')[0];
      if (offLabel.length >= 4 && domainLabel.length >= 4) {
        const distRaw = levenshtein(domainLabel, offLabel);
        const distNorm = levenshtein(normalizedLabel, offLabel);
        if (distRaw > 0 && distRaw <= 2) {
          evidence.push(`Domain spelling "${domainLabel}" has edit distance ${distRaw} from official "${offLabel}"`);
        } else if (distNorm <= 1 && normalizedLabel !== domainLabel) {
          evidence.push(`Domain "${domainLabel}" uses visual character substitution resembling "${offLabel}"`);
        }
      }
    }

    // 3. Page title & content references
    for (const kw of sig.contentKeywords) {
      if (titleLower.includes(kw)) {
        evidence.push(`Page <title> explicitly references "${kw}"`);
      } else if (textLower.includes(kw) && params.hasCredentialFields) {
        evidence.push(`Login/credential page references "${kw}"`);
      }
    }

    const uniqueEvidence = Array.from(new Set(evidence));
    if (uniqueEvidence.length >= 2 || (uniqueEvidence.length >= 1 && params.hasCredentialFields)) {
      const confidence = Math.min(95, 50 + uniqueEvidence.length * 16 + (params.hasCredentialFields ? 14 : 0));
      return {
        brand: sig.brand,
        officialDomain: sig.officialDomains[0],
        confidence,
        evidence: uniqueEvidence,
      };
    }
  }

  return undefined;
}
