export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      padding: '2rem' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🧬 Agent Bio Summary V2
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'rgba(255,255,255,0.9)', 
            marginBottom: '1rem',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
            LLM-driven bio summary agent for synthetic biology education
          </p>
          <p style={{ 
            fontSize: '1.125rem', 
            color: 'rgba(255,255,255,0.8)',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
            This system was designed to educate motivated high school students on advances and applications of synthetic biology.
          </p>
        </div>

        {/* Status Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ 
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', 
            borderRadius: '1rem', 
            padding: '1.5rem', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#1e293b',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🚀 System Status
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>API Status</div>
              <div style={{ 
                display: 'inline-block', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                color: 'white', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '9999px', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
              }}>
                Operational
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>Agent Type</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                LLM-driven with OpenAI function calling
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', 
            borderRadius: '1rem', 
            padding: '1.5rem', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#1e293b',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🔧 Available Endpoints
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                color: 'white',
                padding: '0.5rem 0.75rem', 
                borderRadius: '0.5rem', 
                fontFamily: 'monospace', 
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                display: 'inline-block',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
              }}>
                GET /api/daily-summary
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>API Info</div>
            </div>
            <div>
              <div style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
                color: 'white',
                padding: '0.5rem 0.75rem', 
                borderRadius: '0.5rem', 
                fontFamily: 'monospace', 
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                display: 'inline-block',
                boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)'
              }}>
                POST /api/daily-summary
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Generate Summary</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ 
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', 
          borderRadius: '1rem', 
          padding: '2rem', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)', 
          marginBottom: '3rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🎯 Key Features
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.75rem', 
                marginBottom: '1rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(59, 130, 246, 0.1)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🤖</span>
                <div>
                  <h4 style={{ 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: '#1e40af'
                  }}>LLM-Driven Agent</h4>
                  <p style={{ fontSize: '0.875rem', color: '#475569' }}>
                    Utilizes OpenAI's Agent SDK for dynamic decision-making and tool orchestration
                  </p>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.75rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🔍</span>
                <div>
                  <h4 style={{ 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: '#166534'
                  }}>Smart Search</h4>
                  <p style={{ fontSize: '0.875rem', color: '#475569' }}>
                    Discovers relevant articles using Google Custom Search API
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.75rem', 
                marginBottom: '1rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(245, 158, 11, 0.1)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>📝</span>
                <div>
                  <h4 style={{ 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: '#92400e'
                  }}>Intelligent Summarization</h4>
                  <p style={{ fontSize: '0.875rem', color: '#475569' }}>
                    Generates concise summaries for individual articles using LLM
                  </p>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.75rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(139, 92, 246, 0.1)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>📧</span>
                <div>
                  <h4 style={{ 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: '#7c3aed'
                  }}>Email Delivery</h4>
                  <p style={{ fontSize: '0.875rem', color: '#475569' }}>
                    Professional email delivery via Resend.io with HTML templates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Test Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', 
          borderRadius: '1rem', 
          padding: '2rem', 
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3), 0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>🧪 Test the API</h3>
          <p style={{ 
            marginBottom: '1.5rem',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>Try the API endpoints to see the system in action</p>
          <a
            href="/api/daily-summary"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              color: '#667eea',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.2s ease'
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
