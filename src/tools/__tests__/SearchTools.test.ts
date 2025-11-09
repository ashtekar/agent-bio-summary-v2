import { SearchTools } from '@/tools/SearchTools';

describe('SearchTools', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key';
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  const createMockFetch = (html: string) => {
    return jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => html,
    });
  };

  it('overrides article titles with og:title metadata when available', async () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="Titin tension sensing controls muscle maintenance" />
        </head>
        <body>
          <article>
            <p>Example content about titin tension sensing.</p>
          </article>
        </body>
      </html>
    `;

    const fetchMock = createMockFetch(html);
    // @ts-expect-error - allow assigning to global fetch for tests
    global.fetch = fetchMock;

    const searchTools = new SearchTools();
    const extractionResult = await searchTools.extractArticles([
      {
        id: 'article_1',
        title: 'Issue: Cell Reports',
        url: 'https://www.cell.com/example-article',
        snippet: 'Original snippet',
        publishedDate: new Date(),
        source: 'cell.com',
        relevancyScore: 0,
      },
    ]);

    expect(extractionResult.success).toBe(true);
    if (!extractionResult.data) {
      throw new Error('Expected extraction data');
    }
    const article = extractionResult.data[0];
    expect(article.title).toBe('Titin tension sensing controls muscle maintenance');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to the <title> tag when og:title is unavailable', async () => {
    const html = `
      <html>
        <head>
          <title>CRISPR enables new synthetic biology breakthroughs</title>
        </head>
        <body>
          <p>Example content about CRISPR.</p>
        </body>
      </html>
    `;

    const fetchMock = createMockFetch(html);
    // @ts-expect-error - allow assigning to global fetch for tests
    global.fetch = fetchMock;

    const searchTools = new SearchTools();
    const extractionResult = await searchTools.extractArticles([
      {
        id: 'article_2',
        title: 'Issue: Cell Reports',
        url: 'https://www.cell.com/another-article',
        snippet: 'Original snippet',
        publishedDate: new Date(),
        source: 'cell.com',
        relevancyScore: 0,
      },
    ]);

    expect(extractionResult.success).toBe(true);
    if (!extractionResult.data) {
      throw new Error('Expected extraction data');
    }
    const article = extractionResult.data[0];
    expect(article.title).toBe('CRISPR enables new synthetic biology breakthroughs');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
