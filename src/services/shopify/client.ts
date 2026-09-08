interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
}

interface FetchProductsResult {
  products: ShopifyProduct[];
  pageInfo: { hasNextPage: boolean; endCursor?: string };
}

const API_VERSION = "2024-07";

export function shopifyApiClient(shopDomain: string, accessToken: string) {
  const baseUrl = `https://${shopDomain}/admin/api/${API_VERSION}`;

  async function graphql(query: string, variables: Record<string, unknown>) {
    const res = await fetch(`${baseUrl}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      throw new Error(`Shopify API error: ${res.status} ${await res.text()}`);
    }
    return res.json();
  }

  async function fetchProducts({
    after,
    limit = 50,
  }: {
    after?: string;
    limit?: number;
  }): Promise<FetchProductsResult> {
    const query = `
      query GetProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              title
              descriptionHtml
              priceRangeV2 { minVariantPrice { amount currencyCode } }
            }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    `;

    const data = await graphql(query, { first: limit, after });
    const edges = data.data.products.edges;

    return {
      products: edges.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        description: stripHtml(edge.node.descriptionHtml),
        price: edge.node.priceRangeV2.minVariantPrice.amount,
        currency: edge.node.priceRangeV2.minVariantPrice.currencyCode,
      })),
      pageInfo: data.data.products.pageInfo,
    };
  }

  return { fetchProducts };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
