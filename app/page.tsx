import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 ValentePro App
          </h1>
          <p className="text-xl text-gray-600">
            Modern E-Commerce Platform
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/products" className="card">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🛍️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Products</h2>
              <p className="text-gray-600">Browse our collection of products</p>
            </div>
          </Link>

          <Link href="/orders" className="card">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Orders</h2>
              <p className="text-gray-600">View all customer orders</p>
            </div>
          </Link>

          <Link href="/users" className="card">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Users</h2>
              <p className="text-gray-600">Manage user accounts</p>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Features</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>Next.js 14</strong> - Latest App Router with Server Components</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>TypeScript</strong> - Type-safe development</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>Prisma ORM</strong> - Modern database toolkit</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>PostgreSQL</strong> - Robust relational database</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>Responsive Design</strong> - Mobile-first approach</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>Sample Data</strong> - Pre-populated test data</span>
            </li>
          </ul>
        </div>

        <footer className="mt-12 text-center text-gray-600">
          <p>Built with ❤️ using modern web technologies</p>
        </footer>
      </div>
    </main>
  )
}
