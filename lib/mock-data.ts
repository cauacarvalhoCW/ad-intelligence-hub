import type { Ad, Competitor } from "./types";

// Competidores baseados no schema real e escopo por tema
export const mockCompetitors: Competitor[] = [
  // Competidores BR (InfinitePay scope)
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Mercado Pago",
    website_url: "https://facebook.com/mercadopago",
    industry: "Fintech",
    description: "Maquininhas e soluções de pagamento",
    logo_url:
      "https://images.seeklogo.com/logo-png/34/1/mercado-pago-logo-png_seeklogo-342347.png",
    primary_color: "#009ee3",
    secondary_color: "#0080c7",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Stone",
    website_url: "https://facebook.com/stone",
    industry: "Fintech",
    description: "Maquininha Ton e soluções para negócios",
    logo_url:
      "https://logodownload.org/wp-content/uploads/2022/10/stone-logo-0.png",
    primary_color: "#00d563",
    secondary_color: "#00b84f",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "PagBank",
    website_url: "https://facebook.com/pagbank",
    industry: "Fintech",
    description: "POS e conta digital para empresas",
    logo_url:
      "https://logodownload.org/wp-content/uploads/2019/09/pagbank-logo-0-1.png",
    primary_color: "#ff6900",
    secondary_color: "#e55a00",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Cora",
    website_url: "https://facebook.com/cora",
    industry: "Fintech",
    description: "Conta digital para empresas",
    logo_url: "https://www.cora.com.br/assets/og-image.png",
    primary_color: "#ff6b35",
    secondary_color: "#e55a2b",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Ton",
    website_url: "https://facebook.com/ton",
    industry: "Fintech",
    description: "Maquininha e soluções Stone",
    logo_url:
      "https://i0.wp.com/docs.stone.com.br/wp-content/uploads/2025/01/logo-ton.png?ssl=1",
    primary_color: "#00d563",
    secondary_color: "#00b84f",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    name: "Jeitto",
    website_url: "https://facebook.com/jeitto",
    industry: "Fintech",
    description: "Soluções de pagamento",
    logo_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkNrDSEzqqmj8PAZ0Oz_dfKgDsT6CsGDzJtw&s",
    primary_color: "#7c3aed",
    secondary_color: "#6d28d9",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },

  // Competidores US (JIM scope)
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    name: "Square",
    website_url: "https://facebook.com/square",
    industry: "Fintech",
    description: "Card readers and business solutions",
    logo_url: "https://cdn-icons-png.flaticon.com/512/39/39003.png",
    primary_color: "#000000",
    secondary_color: "#1a1a1a",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    name: "PayPal",
    website_url: "https://facebook.com/paypal",
    industry: "Fintech",
    description: "Digital payments and financial services",
    logo_url:
      "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png",
    primary_color: "#0070ba",
    secondary_color: "#005ea6",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    name: "Stripe",
    website_url: "https://facebook.com/stripe",
    industry: "Fintech",
    description: "Online payment processing",
    logo_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png",
    primary_color: "#635bff",
    secondary_color: "#4f46e5",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: "Venmo",
    website_url: "https://facebook.com/venmo",
    industry: "Fintech",
    description: "P2P payments and social transactions",
    logo_url:
      "https://www.freeiconspng.com/uploads/money-transfer-icon-venmo-logo-png-0.png",
    primary_color: "#3d95ce",
    secondary_color: "#2980b9",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    name: "SumUp",
    website_url: "https://facebook.com/sumup",
    industry: "Fintech",
    description: "Card readers for small businesses",
    logo_url:
      "https://logodownload.org/wp-content/uploads/2019/08/sumup-logo-0.png",
    primary_color: "#00d4aa",
    secondary_color: "#00b894",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// Exemplos de dados baseados no prompt - Mercado Pago, Stone, PagBank, Square
export const mockAds: Ad[] = [
  // Exemplo Mercado Pago (BR)
  {
    id: "mp_point_2024_001",
    competitor_id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Point Pro - Taxa Zero",
    description:
      "Aceite cartão e PIX na sua loja com a Point do Mercado Pago. Taxa zero no débito e PIX. Peça já a sua!",
    platform: "facebook",
    ad_type: "video",
    detected_rates: ["0%", "taxa zero", "2.99%"],
    extracted_text:
      "Aceite cartão e PIX na sua loja com a Point do Mercado Pago. Taxa zero no débito e PIX. Peça já a sua!",
    tags: ["maquininha", "point", "vendas", "pix", "cartão"],
    created_at: "2024-03-20T10:30:00Z",
    updated_at: "2024-03-20T10:30:00Z",
    competitor: mockCompetitors.find((c) => c.name === "Mercado Pago"),
  },

  // Exemplo Stone Ton (BR)
  {
    id: "stone_ton_2024_001",
    competitor_id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Maquininha Ton - Sem Mensalidade",
    description:
      "Maquininha Ton da Stone. Sem mensalidade, taxa a partir de 1,99%. Peça já!",
    platform: "instagram",
    ad_type: "image",
    detected_rates: ["1,99%", "0%", "Grátis"],
    extracted_text:
      "Maquininha Ton da Stone. Sem mensalidade, taxa a partir de 1,99%. Peça já!",
    tags: ["maquininha", "ton", "sem mensalidade", "taxa baixa"],
    created_at: "2024-03-15T14:20:00Z",
    updated_at: "2024-03-15T14:20:00Z",
    competitor: mockCompetitors.find((c) => c.name === "Stone"),
  },

  // Exemplo PagBank (BR)
  {
    id: "pagbank_pos_2024_001",
    competitor_id: "550e8400-e29b-41d4-a716-446655440003",
    title: "PagBank POS - Tudo em Um",
    description:
      "PagBank POS: receba com cartão, PIX e conta digital tudo em um só lugar. Taxa competitiva!",
    platform: "facebook",
    ad_type: "video",
    detected_rates: ["2,49%", "0%", "0%"],
    extracted_text:
      "PagBank POS: receba com cartão, PIX e conta digital tudo em um só lugar. Taxa competitiva!",
    tags: ["pos", "pagbank", "conta digital", "pix"],
    created_at: "2024-03-18T09:15:00Z",
    updated_at: "2024-03-18T09:15:00Z",
    competitor: mockCompetitors.find((c) => c.name === "PagBank"),
  },

  // Exemplo Square (US)
  {
    id: "square_reader_2024_001",
    competitor_id: "550e8400-e29b-41d4-a716-446655440007",
    title: "Square Reader - Accept Anywhere",
    description:
      "Accept payments anywhere with Square Reader. 2.6% + 10¢ per transaction. Get started today!",
    platform: "google",
    ad_type: "video",
    detected_rates: ["2.6% + $0.10", "2.6% + $0.10"],
    extracted_text:
      "Accept payments anywhere with Square Reader. 2.6% + 10¢ per transaction. Get started today!",
    tags: ["card reader", "square", "small business", "contactless"],
    created_at: "2024-03-20T16:30:00Z",
    updated_at: "2024-03-20T16:30:00Z",
    competitor: mockCompetitors.find((c) => c.name === "Square"),
  },

  // Exemplo PayPal (US)
  {
    id: "paypal_business_2024_001",
    competitor_id: "550e8400-e29b-41d4-a716-446655440008",
    title: "PayPal Business - Online Payments",
    description:
      "Accept online payments with PayPal Business. 2.9% + $0.30 per transaction. No monthly fees!",
    platform: "linkedin",
    ad_type: "image",
    detected_rates: ["2.9% + $0.30", "$0"],
    extracted_text:
      "Accept online payments with PayPal Business. 2.9% + $0.30 per transaction. No monthly fees!",
    tags: ["online payments", "paypal", "business", "no monthly fees"],
    created_at: "2024-03-22T11:45:00Z",
    updated_at: "2024-03-22T11:45:00Z",
    competitor: mockCompetitors.find((c) => c.name === "PayPal"),
  },

  // Exemplo Stripe (US)
  {
    id: "stripe_connect_2024_001",
    competitor_id: "550e8400-e29b-41d4-a716-446655440009",
    title: "Stripe Connect - Developer-First",
    description:
      "Build powerful payment experiences with Stripe Connect. 2.9% + 30¢ per successful charge.",
    platform: "facebook",
    ad_type: "text",
    detected_rates: ["2.9% + $0.30"],
    extracted_text:
      "Build powerful payment experiences with Stripe Connect. 2.9% + 30¢ per successful charge.",
    tags: ["api", "stripe", "developers", "connect"],
    created_at: "2024-03-25T08:20:00Z",
    updated_at: "2024-03-25T08:20:00Z",
    competitor: mockCompetitors.find((c) => c.name === "Stripe"),
  },

  // Mais exemplos BR
  {
    id: "cora_conta_2024_001",
    competitor_id: "550e8400-e29b-41d4-a716-446655440004",
    title: "Cora - Conta Digital Empresarial",
    description:
      "Conta digital para sua empresa com PIX grátis e cartão sem anuidade. Abra já!",
    platform: "facebook",
    ad_type: "video",
    detected_rates: ["0%", "Grátis"],
    extracted_text:
      "Conta digital para sua empresa com PIX grátis e cartão sem anuidade. Abra já!",
    tags: ["conta digital", "empresarial", "pix grátis", "sem anuidade"],
    created_at: "2024-03-12T15:30:00Z",
    updated_at: "2024-03-12T15:30:00Z",
    competitor: mockCompetitors.find((c) => c.name === "Cora"),
  },

  // Mais exemplos US
  {
    id: "venmo_business_2024_001",
    competitor_id: "550e8400-e29b-41d4-a716-446655440010",
    title: "Venmo Business - Social Payments",
    description:
      "Accept Venmo payments for your business. 1.9% + $0.10 per transaction. Social commerce made easy!",
    platform: "instagram",
    ad_type: "video",
    detected_rates: ["1.9% + $0.10"],
    extracted_text:
      "Accept Venmo payments for your business. 1.9% + $0.10 per transaction. Social commerce made easy!",
    tags: ["venmo", "social payments", "business", "mobile"],
    created_at: "2024-03-28T12:15:00Z",
    updated_at: "2024-03-28T12:15:00Z",
    competitor: mockCompetitors.find((c) => c.name === "Venmo"),
  },
];
