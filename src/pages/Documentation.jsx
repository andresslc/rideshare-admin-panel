import { useState } from 'react'
import { Copy, Check, ChevronRight, ChevronDown, Book, Code, Palette, Settings, Rocket, Shield } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const [copiedCode, setCopiedCode] = useState('')
  const [expandedSections, setExpandedSections] = useState({
    'getting-started': true,
    'configuration': false,
    'components': false,
    'deployment': false
  })

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: Book,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Admin Panel Template</h2>
            <p className="text-text-secondary mb-4">
              A modern, responsive admin dashboard template built with React, Vite, and Tailwind CSS v4. 
              Features a clean design, dark mode support, and comprehensive component library.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">✨ Features</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>• Modern React 18 with Hooks</li>
                <li>• Tailwind CSS v4 with CSS Variables</li>
                <li>• Dark/Light theme support</li>
                <li>• Responsive design</li>
                <li>• Authentication system</li>
                <li>• Form handling with react-hook-form</li>
                <li>• Charts with Recharts</li>
                <li>• Icon library with Lucide React</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">🛠️ Tech Stack</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>• React 18.2.0</li>
                <li>• Vite 5.0.0</li>
                <li>• Tailwind CSS v4</li>
                <li>• React Router DOM 6.20.1</li>
                <li>• React Hook Form 7.48.2</li>
                <li>• Recharts 2.8.0</li>
                <li>• Lucide React 0.294.0</li>
                <li>• Date-fns 2.30.0</li>
              </ul>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'installation',
      title: 'Installation',
      icon: Rocket,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Getting Started</h2>
            <p className="text-text-secondary mb-6">
              Follow these steps to set up the admin panel template in your development environment.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">1. Clone the Repository</h3>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">
{`git clone https://github.com/your-repo/admin-panel-template.git
cd admin-panel-template`}
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`git clone https://github.com/your-repo/admin-panel-template.git\ncd admin-panel-template`, 'clone')}
                  icon={copiedCode === 'clone' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">2. Install Dependencies</h3>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">npm install</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard('npm install', 'install')}
                  icon={copiedCode === 'install' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">3. Start Development Server</h3>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">npm run dev</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard('npm run dev', 'dev')}
                  icon={copiedCode === 'dev' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">4. Build for Production</h3>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">npm run build</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard('npm run build', 'build')}
                  icon={copiedCode === 'build' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'structure',
      title: 'Project Structure',
      icon: Code,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Project Structure</h2>
            <p className="text-text-secondary mb-6">
              Understanding the project structure will help you navigate and customize the template effectively.
            </p>
          </div>

          <div className="relative">
            <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto text-sm">
              <code className="text-text-primary">
{`admin-panel-template/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   ├── common/          # Common components
│   │   └── auth/            # Authentication components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Page components
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   ├── App.jsx              # Main app component
│   ├── App.css              # Global styles
│   └── main.jsx             # Entry point
├── package.json
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite configuration
└── README.md`}
              </code>
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(`admin-panel-template/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   ├── common/          # Common components
│   │   └── auth/            # Authentication components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Page components
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   ├── App.jsx              # Main app component
│   ├── App.css              # Global styles
│   └── main.jsx             # Entry point
├── package.json
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite configuration
└── README.md`, 'structure')}
              icon={copiedCode === 'structure' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            />
          </div>
        </div>
      )
    },
    {
      id: 'configuration',
      title: 'Configuration',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Configuration</h2>
            <p className="text-text-secondary mb-6">
              Customize the admin panel by modifying the configuration files.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">App Configuration</h3>
              <p className="text-text-secondary mb-4">
                Update basic app information in <code className="bg-surface-secondary px-2 py-1 rounded">src/config/constants.js</code>
              </p>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">
{`export const APP_CONFIG = {
  name: 'Your Admin Panel',
  version: '1.0.0',
  description: 'Your custom admin dashboard',
  author: 'Your Company',
  logo: '/your-logo.svg'
}`}
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`export const APP_CONFIG = {
  name: 'Your Admin Panel',
  version: '1.0.0',
  description: 'Your custom admin dashboard',
  author: 'Your Company',
  logo: '/your-logo.svg'
}`, 'app-config')}
                  icon={copiedCode === 'app-config' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Color Configuration</h3>
              <p className="text-text-secondary mb-4">
                Customize primary and secondary colors easily:
              </p>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">
{`export const COLOR_CONFIG = {
  primary: {
    name: 'Blue',
    hex: '#3B82F6',
    enabled: true
  },
  secondary: {
    name: 'Purple',
    hex: '#8B5CF6',
    enabled: true // Set to false to disable
  }
}`}
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`export const COLOR_CONFIG = {
  primary: {
    name: 'Blue',
    hex: '#3B82F6',
    enabled: true
  },
  secondary: {
    name: 'Purple',
    hex: '#8B5CF6',
    enabled: true // Set to false to disable
  }
}`, 'color-config')}
                  icon={copiedCode === 'color-config' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Theme Options</h3>
              <p className="text-text-secondary mb-4">
                Control theme behavior:
              </p>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">
{`export const THEME_OPTIONS = {
  enableThemeToggle: true,    // Enable/disable theme switching
  defaultTheme: 'light',      // 'light' or 'dark'
  forceTheme: null,          // Force a theme: 'light', 'dark', or null
  enableSecondaryColor: true  // Enable/disable secondary color
}`}
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`export const THEME_OPTIONS = {
  enableThemeToggle: true,    // Enable/disable theme switching
  defaultTheme: 'light',      // 'light' or 'dark'
  forceTheme: null,          // Force a theme: 'light', 'dark', or null
  enableSecondaryColor: true  // Enable/disable secondary color
}`, 'theme-options')}
                  icon={copiedCode === 'theme-options' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'theming',
      title: 'Theming & Colors',
      icon: Palette,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Theming & Colors</h2>
            <p className="text-text-secondary mb-6">
              The template uses Tailwind CSS v4 with CSS variables for easy theming and color customization.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">CSS Variables</h3>
              <p className="text-text-secondary mb-4">
                Colors are defined as CSS variables in <code className="bg-surface-secondary px-2 py-1 rounded">src/App.css</code>:
              </p>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">
{`@theme {
  --color-primary-500: #f16321;
  --color-secondary-500: #f58b32;
  --color-background: #ffffff;
  --color-text-primary: #111827;
  /* Dark mode variants */
  --color-dark-background: #0f172a;
  --color-dark-text-primary: #f8fafc;
}`}
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`@theme {
  --color-primary-500: #f16321;
  --color-secondary-500: #f58b32;
  --color-background: #ffffff;
  --color-text-primary: #111827;
  /* Dark mode variants */
  --color-dark-background: #0f172a;
  --color-dark-text-primary: #f8fafc;
}`, 'css-vars')}
                  icon={copiedCode === 'css-vars' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Using Colors in Components</h3>
              <p className="text-text-secondary mb-4">
                Use semantic color classes in your components:
              </p>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">
{`// Background colors
className="bg-surface"           // Main surface
className="bg-surface-secondary" // Secondary surface
className="bg-primary-500"       // Primary color

// Text colors
className="text-text-primary"    // Primary text
className="text-text-secondary"  // Secondary text
className="text-primary-600"     // Primary colored text

// Border colors
className="border-border"        // Default border
className="border-primary-500"   // Primary border`}
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`// Background colors
className="bg-surface"           // Main surface
className="bg-surface-secondary" // Secondary surface
className="bg-primary-500"       // Primary color

// Text colors
className="text-text-primary"    // Primary text
className="text-text-secondary"  // Secondary text
className="text-primary-600"     // Primary colored text

// Border colors
className="border-border"        // Default border
className="border-primary-500"   // Primary border`, 'color-usage')}
                  icon={copiedCode === 'color-usage' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Dark Mode Implementation</h3>
              <p className="text-text-secondary mb-4">
                Dark mode is handled automatically through the ThemeContext:
              </p>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">
{`import { useTheme } from '../contexts/ThemeContext'

const MyComponent = () => {
  const { isDark, toggleTheme } = useTheme()
  
  return (
    <div className="bg-surface text-text-primary">
      <button onClick={toggleTheme}>
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  )
}`}
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`import { useTheme } from '../contexts/ThemeContext'

const MyComponent = () => {
  const { isDark, toggleTheme } = useTheme()
  
  return (
    <div className="bg-surface text-text-primary">
      <button onClick={toggleTheme}>
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  )
}`, 'dark-mode')}
                  icon={copiedCode === 'dark-mode' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'components',
      title: 'Components',
      icon: Code,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Components</h2>
            <p className="text-text-secondary mb-6">
              The template includes a comprehensive set of reusable UI components.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Button Component</h3>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">
{`import Button from '../components/ui/Button'

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icon
<Button icon={<Plus className="w-4 h-4" />}>
  Add Item
</Button>`}
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`import Button from '../components/ui/Button'

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icon
<Button icon={<Plus className="w-4 h-4" />}>
  Add Item
</Button>`, 'button-usage')}
                  icon={copiedCode === 'button-usage' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">DataTable Component</h3>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">
{`import DataTable from '../components/common/DataTable'

const columns = [
  { key: 'name', label: 'Name',  },
  { key: 'email', label: 'Email',  },
  { key: 'status', label: 'Status',  }
]

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' }
]

<DataTable
  columns={columns}
  data={data}
  searchable={true}
  pagination={true}
  onRowClick={(row) => console.log(row)}
/>`}
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`import DataTable from '../components/common/DataTable'

const columns = [
  { key: 'name', label: 'Name',  },
  { key: 'email', label: 'Email',  },
  { key: 'status', label: 'Status',  }
]

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' }
]

<DataTable
  columns={columns}
  data={data}
  searchable={true}
  pagination={true}
  onRowClick={(row) => console.log(row)}
/>`, 'datatable-usage')}
                  icon={copiedCode === 'datatable-usage' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Form with React Hook Form</h3>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">
{`import { useForm } from 'react-hook-form'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  
  const onSubmit = (data) => {
    console.log(data)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Email"
        type="email"
        {...register('email', { required: 'Email is required' })}
        error={errors.email?.message}
      />
      <Button type="submit">Submit</Button>
    </form>
  )
}`}
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`import { useForm } from 'react-hook-form'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  
  const onSubmit = (data) => {
    console.log(data)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Email"
        type="email"
        {...register('email', { required: 'Email is required' })}
        error={errors.email?.message}
      />
      <Button type="submit">Submit</Button>
    </form>
  )
}`, 'form-usage')}
                  icon={copiedCode === 'form-usage' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'authentication',
      title: 'Authentication',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Authentication System</h2>
            <p className="text-text-secondary mb-6">
              The template includes a complete authentication system with login, registration, and password recovery.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">AuthContext Usage</h3>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">
{`import { useAuth } from '../contexts/AuthContext'

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth()
  
  const handleLogin = async (credentials) => {
    try {
      await login(credentials)
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </div>
  )
}`}
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`import { useAuth } from '../contexts/AuthContext'

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth()
  
  const handleLogin = async (credentials) => {
    try {
      await login(credentials)
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </div>
  )
}`, 'auth-usage')}
                  icon={copiedCode === 'auth-usage' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Protected Routes</h3>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">
{`import ProtectedRoute from '../components/auth/ProtectedRoute'

// In your App.jsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/" element={
    <ProtectedRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  } />
  <Route path="/users" element={
    <ProtectedRoute>
      <Layout>
        <Users />
      </Layout>
    </ProtectedRoute>
  } />
</Routes>`}
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`import ProtectedRoute from '../components/auth/ProtectedRoute'

// In your App.jsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/" element={
    <ProtectedRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  } />
  <Route path="/users" element={
    <ProtectedRoute>
      <Layout>
        <Users />
      </Layout>
    </ProtectedRoute>
  } />
</Routes>`, 'protected-routes')}
                  icon={copiedCode === 'protected-routes' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'deployment',
      title: 'Deployment',
      icon: Rocket,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Deployment</h2>
            <p className="text-text-secondary mb-6">
              Deploy your admin panel to various platforms with these step-by-step guides.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Vercel Deployment</h3>
              <div className="space-y-4">
                <p className="text-text-secondary">
                  1. Install Vercel CLI: <code className="bg-surface-secondary px-2 py-1 rounded">npm i -g vercel</code>
                </p>
                <p className="text-text-secondary">
                  2. Run: <code className="bg-surface-secondary px-2 py-1 rounded">vercel</code>
                </p>
                <p className="text-text-secondary">
                  3. Follow the prompts to deploy
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Netlify Deployment</h3>
              <div className="space-y-4">
                <p className="text-text-secondary">
                  1. Build the project: <code className="bg-surface-secondary px-2 py-1 rounded">npm run build</code>
                </p>
                <p className="text-text-secondary">
                  2. Drag and drop the <code className="bg-surface-secondary px-2 py-1 rounded">dist</code> folder to Netlify
                </p>
                <p className="text-text-secondary">
                  3. Or connect your Git repository for automatic deployments
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Environment Variables</h3>
              <div className="relative">
                <pre className="bg-surface-secondary p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-text-primary">
{`# .env
VITE_API_BASE_URL=https://your-api.com/api
VITE_APP_NAME=Your Admin Panel
VITE_APP_VERSION=1.0.0`}
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`# .env
VITE_API_BASE_URL=https://your-api.com/api
VITE_APP_NAME=Your Admin Panel
VITE_APP_VERSION=1.0.0`, 'env-vars')}
                  icon={copiedCode === 'env-vars' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                />
              </div>
            </Card>
          </div>
        </div>
      )
    }
  ]

  const sidebarSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      items: [
        { id: 'overview', title: 'Overview' },
        { id: 'installation', title: 'Installation' },
        { id: 'structure', title: 'Project Structure' }
      ]
    },
    {
      id: 'configuration',
      title: 'Configuration',
      items: [
        { id: 'configuration', title: 'App Configuration' },
        { id: 'theming', title: 'Theming & Colors' }
      ]
    },
    {
      id: 'components',
      title: 'Components',
      items: [
        { id: 'components', title: 'UI Components' },
        { id: 'authentication', title: 'Authentication' }
      ]
    },
    {
      id: 'deployment',
      title: 'Deployment',
      items: [
        { id: 'deployment', title: 'Deployment Guide' }
      ]
    }
  ]

  const currentSection = sections.find(section => section.id === activeSection)

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-surface border-r border-border h-screen sticky top-0 overflow-y-auto">
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-bold text-text-primary">Documentation</h1>
            <p className="text-sm text-text-secondary mt-1">Admin Panel Template</p>
          </div>
          
          <nav className="p-4 space-y-2">
            {sidebarSections.map(section => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors duration-200"
                >
                  <span>{section.title}</span>
                  {expandedSections[section.id] ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                  }
                </button>
                
                {expandedSections[section.id] && (
                  <div className="ml-4 mt-1 space-y-1">
                    {section.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                          activeSection === item.id
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {currentSection && (
              <div className="fade-in">
                {currentSection.content}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Documentation
