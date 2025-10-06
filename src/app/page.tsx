export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            🧬 Agent Bio Summary V2
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '1rem' }}>
            LLM-driven bio summary agent for synthetic biology education
          </p>
          <p style={{ fontSize: '1.125rem', color: '#94a3b8' }}>
            This system was designed to educate motivated high school students on advances and applications of synthetic biology.
          </p>
        </div>

        {/* Status Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              🚀 System Status
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>API Status</div>
              <div style={{ 
                display: 'inline-block', 
                backgroundColor: '#dcfce7', 
                color: '#166534', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '9999px', 
                fontSize: '0.875rem', 
                fontWeight: '500' 
              }}>
                Operational
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Agent Type</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                LLM-driven with OpenAI function calling
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              🔧 Available Endpoints
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                backgroundColor: '#f1f5f9', 
                padding: '0.5rem 0.75rem', 
                borderRadius: '0.25rem', 
                fontFamily: 'monospace', 
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                display: 'inline-block'
              }}>
                GET /api/daily-summary
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>API Info</div>
            </div>
            <div>
              <div style={{ 
                backgroundColor: '#f1f5f9', 
                padding: '0.5rem 0.75rem', 
                borderRadius: '0.25rem', 
                fontFamily: 'monospace', 
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                display: 'inline-block'
              }}>
                POST /api/daily-summary
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Generate Summary</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', textAlign: 'center' }}>
            🎯 Key Features
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🤖</span>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>LLM-Driven Agent</h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Utilizes OpenAI's Agent SDK for dynamic decision-making and tool orchestration
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🔍</span>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Smart Search</h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Discovers relevant articles using Google Custom Search API
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📝</span>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Intelligent Summarization</h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Generates concise summaries for individual articles using LLM
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📧</span>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Email Delivery</h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Professional email delivery via Resend.io with HTML templates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Test Section */}
        <div style={{ 
          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', 
          borderRadius: '0.5rem', 
          padding: '2rem', 
          color: 'white',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>🧪 Test the API</h3>
          <p style={{ marginBottom: '1.5rem' }}>Try the API endpoints to see the system in action</p>
          <a
            href="/api/daily-summary"
            style={{
              display: 'inline-block',
              backgroundColor: 'white',
              color: '#3b82f6',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              textDecoration: 'none'
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            View API Information →
          </a>
        </div>
      </div>
    </div>
  );
}
