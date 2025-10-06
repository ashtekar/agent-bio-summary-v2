import '@testing-library/jest-dom'

// Mock global objects for Node.js environment
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Request and Response for Next.js API routes
global.Request = global.Request || class Request {
  constructor(input, init = {}) {
    this.url = input;
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body;
  }
  
  async json() {
    return JSON.parse(this.body || '{}');
  }
}

global.Response = global.Response || class Response {
  static json(data, init = {}) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
  }
  
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.headers = new Map(Object.entries(init.headers || {}));
  }
  
  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
}

// Load real environment variables for integration testing
const dotenv = require('dotenv')
const path = require('path')

// Load .env.local file for integration tests
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Create a flexible fetch mock that can handle real HTTP calls for integration tests
const originalFetch = global.fetch

global.fetch = jest.fn((url, options = {}) => {
  // For integration tests, allow real HTTP calls to external APIs
  if (process.env.NODE_ENV === 'test' && typeof url === 'string') {
    // Check if this is a real API call (not a mock)
    const isRealApiCall = (
      url.includes('api.openai.com') ||
      url.includes('googleapis.com') ||
      url.includes('supabase.co') ||
      url.includes('resend.com') ||
      url.includes('api.langchain.com')
    )
    
    if (isRealApiCall && originalFetch) {
      console.log(`🌐 Making real HTTP call to: ${url}`)
      return originalFetch(url, options)
    }
  }

  // Default mock response for unit tests
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Map([['content-type', 'application/json']]),
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new global.Blob()),
    arrayBuffer: () => Promise.resolve(new global.ArrayBuffer(0)),
    clone: () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map([['content-type', 'application/json']]),
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    }),
  })
})

// Add missing global objects for Node.js environment
global.ReadableStream = global.ReadableStream || require('stream').Readable
global.TextEncoder = global.TextEncoder || require('util').TextEncoder
global.TextDecoder = global.TextDecoder || require('util').TextDecoder

// Add Blob and ArrayBuffer for fetch compatibility
global.Blob = global.Blob || class Blob {
  constructor(chunks = [], options = {}) {
    this.size = 0
    this.type = options.type || ''
  }
}

global.ArrayBuffer = global.ArrayBuffer || class ArrayBuffer {
  constructor(length) {
    this.byteLength = length || 0
  }
  static isView() { return false }
}

// Add AbortSignal polyfill for Langchain compatibility
if (!global.AbortSignal) {
  global.AbortSignal = class AbortSignal {
    constructor() {
      this.aborted = false
      this.reason = undefined
      this.onabort = null
      this._listeners = []
    }
    
    addEventListener(type, listener) {
      if (type === 'abort') {
        this._listeners.push(listener)
      }
    }
    
    removeEventListener(type, listener) {
      if (type === 'abort') {
        this._listeners = this._listeners.filter(l => l !== listener)
      }
    }
    
    dispatchEvent(event) {
      if (event.type === 'abort') {
        this.aborted = true
        this.reason = event.reason
        if (this.onabort) {
          this.onabort(event)
        }
        this._listeners.forEach(listener => listener(event))
        return true
      }
      return false
    }
  }
  
  // Add static methods to the class after definition
  global.AbortSignal.timeout = function(delay) {
    const controller = new global.AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort(new Error('Timeout'))
    }, delay)
    
    // Store timeout ID for potential cleanup
    controller.signal._timeoutId = timeoutId
    return controller.signal
  }
  
  global.AbortSignal.abort = function(reason) {
    const controller = new global.AbortController()
    controller.abort(reason)
    return controller.signal
  }
}

if (!global.AbortController) {
  global.AbortController = class AbortController {
    constructor() {
      this.signal = new global.AbortSignal()
    }
    
    abort(reason) {
      const event = { type: 'abort', reason }
      this.signal.dispatchEvent(event)
    }
  }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: class NextRequest extends global.Request {
    constructor(input, init) {
      super(input, init);
    }
  },
  NextResponse: {
    json: (data, init) => {
      return new global.Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });
    },
  },
}))

