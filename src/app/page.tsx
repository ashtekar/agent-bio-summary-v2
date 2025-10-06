export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              🧬 Agent Bio Summary V2
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              LLM-driven bio summary agent for synthetic biology education
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              This system was designed to educate motivated high school students on advances and applications of synthetic biology.
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                🚀 System Status
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium mb-2">API Status</div>
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium w-fit">
                    Operational
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium mb-2">Agent Type</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    LLM-driven with OpenAI function calling
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                🔧 Available Endpoints
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded font-mono w-fit mb-2">
                    GET /api/daily-summary
                  </div>
                  <div className="text-xs text-gray-500">API Info</div>
                </div>
                <div>
                  <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded font-mono w-fit mb-2">
                    POST /api/daily-summary
                  </div>
                  <div className="text-xs text-gray-500">Generate Summary</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              🎯 Key Features
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">LLM-Driven Agent</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Utilizes OpenAI's Agent SDK for dynamic decision-making and tool orchestration
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Smart Search</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Discovers relevant articles using Google Custom Search API
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Intelligent Summarization</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Generates concise summaries for individual articles using LLM
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Email Delivery</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Professional email delivery via Resend.io with HTML templates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API Test Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
            <h3 className="text-2xl font-semibold mb-4">🧪 Test the API</h3>
            <p className="mb-6">Try the API endpoints to see the system in action</p>
            <div className="space-y-4">
              <a
                href="/api/daily-summary"
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                View API Information →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
