# Example Rides Admin Panel - Comprehensive Engineering & Operations Documentation

## 1. Executive Summary & Overview
The **Example Rides Admin Panel** is a mission-critical, enterprise-grade Single Page Application (SPA) designed to manage all administrative, operational, financial, and regulatory operations of the **Example Rides** ride-hailing and carpooling ecosystem.

The platform provides platform super administrators, operations teams, and customer support representatives with end-to-end operational visibility and administrative control over:
- **Riders & Drivers**: Account lifecycles, activity audits, suspension states, rewarded balance transactions, and data exports.
- **Driver Verification**: Document audits (commercial/personal driver licenses, vehicle registrations, insurance policies) with an interactive inspection viewer (zoom, rotation, inspection notes, approval/rejection reasons).
- **Vehicle Cataloging**: Vehicle model categorization and ride type associations (`economy`, `luxury`, `carpool`).
- **Dynamic Pricing & Peak Windows**: Dual pricing models comprising global fallback rates and city-based fixed mileage bracket pricing across Florida cities, coupled with scheduled surge pricing windows.
- **Ride Operations**: Monitoring and tracking of completed, ongoing, and cancelled **Private Rides** and **Carpool Rides** (multi-stop waypoint and passenger tracking).
- **Real-Time Fleet Telemetry (Bird's Eye View)**: Live Google Maps tracking with dynamic SVG vehicle headings, status polling, and cluster views.
- **Financials & Accounting**: Driver subscription fee revenues, driver payout/withdrawal requests, and commission analytics.
- **Marketing & Campaigns**: Single public coupon codes and bulk-generated unique alphanumeric promo codes with usage caps, per-user limits, and city/ride-type eligibility.
- **Safety, Trust & Incident Management**: Incident reports, dispute resolution, and audit logs.
- **Targeted Communications**: Role-based, user-specific, and broadcast push notifications.

---

## 2. Technical Stack & Key Dependencies

| Layer | Technologies / Libraries | Purpose & Details |
| :--- | :--- | :--- |
| **Framework & Runtime** | React 18.2.0, Vite 6.0.3, TypeScript types | Ultra-fast HMR, ES module bundling, modern React features (Concurrent Mode, Hooks). |
| **Routing** | `react-router-dom` v6.20.1 | Client-side routing, nested layouts, programmatic redirects, route-level permission guards. |
| **Styling & Design System** | Tailwind CSS v3.4.17, PostCSS, Autoprefixer | Utility-first styling with dynamic CSS variables for real-time theme customization. |
| **UI Primitives** | Radix UI (`@radix-ui/react-*`), Lucide Icons, React Icons | Headless, accessible primitives (Modals, Dropdowns, Sliders, Accordions, Tabs). |
| **Form Management** | `react-hook-form` v7.48.2, `@hookform/resolvers`, `zod` v3.25 | Performant uncontrolled forms with type-safe schema validation and runtime constraint checks. |
| **HTTP & Networking** | Axios v1.11.0 | Centralized interceptors, bearer token injection, error normalization, and `AbortController` cancellation. |
| **Charts & Visualizations** | Recharts v2.8.0, Chart.js v4.5.1, `react-chartjs-2` | Interactive analytics, ride metrics, distribution donuts, revenue trends, and user growth charts. |
| **Maps & Geolocation** | `@react-google-maps/api` v2.20.8 | Live fleet tracking, custom vector markers, heading rotation, and route geometry. |
| **Toasts & Feedback** | `react-hot-toast` v2.6.0 | Toast notification system with custom styling and error-handling helpers. |
| **Date & Time** | `date-fns` v2.30.0 + Native Intl APIs | Timezone-aware date/time formatting, date ranges, and ISO timestamp conversions. |

---

## 3. Directory Structure

```
rideshare-admin-panel/
├── public/                     # Static assets (favicons, logos, icons, vector graphics)
│   ├── icons/                  # Vehicle type icons
│   └── logo.svg                # App logo and favicon
├── src/
│   ├── components/             # Reusable UI & Layout Components
│   │   ├── admin/              # Admin-specific modals (AdminUserModal.jsx)
│   │   ├── auth/               # Route protection (ProtectedRoute.jsx)
│   │   ├── common/             # Tables, StatsCards, Profile Modals, Calendar, DateTable
│   │   ├── global/             # ConfirmModal, Drawer, GlobalFilter
│   │   ├── layout/             # Header, Sidebar, Layout wrapper
│   │   ├── loader/             # DashboardLoader and suspense spinners
│   │   └── ui/                 # 18+ Primitives: Button, Card, Input, Modal, Badge, Select,
│   │                           # MultiSelect, FilterBar, ImageUploader, ImagesGallery, etc.
│   ├── config/
│   │   └── constants.js        # APP_CONFIG, COLOR_CONFIG, FLORIDA_CITIES, MENU_ITEMS,
│   │                           # USER_ROLES, PERMISSIONS, SECURITY_CONFIG, PAGINATION_CONFIG
│   ├── contexts/
│   │   ├── AppContext.jsx      # Global UI state (sidebar state, menu RBAC filtering)
│   │   ├── AuthContext.jsx     # Auth state, session timeout, lockout, permissions, login/logout
│   │   └── ThemeContext.jsx    # Light/Dark mode & dynamic primary/secondary palette generator
│   ├── hooks/                  # Custom Domain & Utility React Hooks
│   │   ├── admin/              # useAdminUsers.js
│   │   ├── app-configs/        # useAppConfigsActions.js
│   │   ├── auth/               # useAuthActions.js
│   │   ├── campaigns/          # useCampaigns.js, useCampaignDetail.js
│   │   ├── categories/         # useGetAllCategories.js, useCreateCategory.js, useCategoryActions.js
│   │   ├── dashboard-analytics/# useGetDashboardAnalytics.js
│   │   ├── Docs/               # useGetDocuments.js
│   │   ├── drivers/            # useGetDrivers.js, useGetRequestsCount.js
│   │   ├── global/             # useDebounce.tsx, usePersistentState.js, useRequestGuard.js
│   │   ├── orders/             # useOrderActions.js
│   │   ├── products/           # useGetAllProducts.js, useCreateProduct.js, useProductActions.js
│   │   ├── revenue/            # useGetSubscriptionRevenue.js, useGetWithdrawalRevenue.js
│   │   ├── ride-rates/         # useRideRatesActions.js, usePeakWindowsActions.js
│   │   ├── rides/              # useGetRides.js, useGetCarpoolRides.js
│   │   ├── users/              # useGetUsers.js, useGetUserDetails.js, useUserActions.js,
│   │   │                       # useGetSuspendedDrivers.js, useGetRewardedBalanceHistory.js
│   │   └── vehicle-types/      # useGetAllVehicleTypes.js, useCreateVehicleType.js, useVehicleTypeActions.js
│   ├── lib/
│   │   └── services.js         # Centralized Axios instance, interceptors, error handling, 60+ APIs
│   ├── pages/                  # 40 Route Views
│   │   ├── auth/               # Login, ForgotPassword, VerifyOTP, ResetPassword
│   │   ├── AdminUsers.jsx      # Admin account management (Super Admin only)
│   │   ├── Analytics.jsx       # Deep analytics & metrics
│   │   ├── BirdsEyeView.jsx    # Live Google Maps fleet telemetry
│   │   ├── Campaigns.jsx       # Promo discount campaigns list & creator
│   │   ├── CampaignDetail.jsx  # Campaign analytics, redemptions & generated code vouchers
│   │   ├── CarpoolRides.jsx    # Carpool rides table with status tabs & CSV export
│   │   ├── CarpoolRideDetail.jsx # Multi-passenger carpool itinerary & stops detail
│   │   ├── Categories.jsx      # Legacy category management
│   │   ├── ChangePassword.jsx  # Super admin password change
│   │   ├── ChatSupport.jsx     # In-app support chat interface
│   │   ├── Configurations.jsx  # Global system configurations
│   │   ├── ContentManagement.jsx# App content & CMS pages
│   │   ├── Dashboard.jsx       # Platform analytics, counters, and pending queues
│   │   ├── Documentation.jsx   # In-app reference & guides
│   │   ├── DriverDetail.jsx    # Driver profile summary
│   │   ├── DriverDetails.jsx   # Document review & verification workspace
│   │   ├── DriverRequests.jsx  # Pending driver registrations
│   │   ├── Emergencie.jsx      # Emergency SOS logs
│   │   ├── EmergencyDetails.jsx# Emergency case details
│   │   ├── Notifications.jsx   # Targeted & broadcast push notifications
│   │   ├── Orders.jsx          # Order fulfillment view
│   │   ├── PeakWindows.jsx     # Peak surcharge schedule rules
│   │   ├── PrivacyPolicy.jsx   # Public privacy policy
│   │   ├── PrivateRides.jsx    # Private rides table with status tabs & CSV export
│   │   ├── Products.jsx        # Product management
│   │   ├── ReportDetail.jsx    # Incident investigation & resolution
│   │   ├── Reports.jsx         # Flagged incident reports
│   │   ├── Revenue.jsx         # Subscription & withdrawal revenue analytics
│   │   ├── RewardedBalanceHistory.jsx # Points and reward ledger
│   │   ├── RideRates.jsx       # Global & City-based bracket pricing configuration
│   │   ├── RiderDetail.jsx     # Rider profile summary & ride history
│   │   ├── SendEmail.jsx       # Direct email communications
│   │   ├── SupportTickets.jsx  # Customer support tickets
│   │   ├── SuspendedDrivers.jsx# Suspension management (auto vs timed vs permanent)
│   │   ├── TermCondtion.jsx    # Public terms & conditions
│   │   ├── Transactions.jsx    # Driver wallet transaction logs
│   │   ├── UserDetailPage.jsx  # User profile details
│   │   ├── Users.jsx           # User management (Riders & Drivers) with custom export
│   │   ├── Vehicle.jsx         # Vehicle details
│   │   └── VehicleCategory.jsx # Vehicle models & ride type mapping
│   ├── utils/
│   │   └── helpers.js          # Currency, percentage, phone & date formatters, CSV generator, toast helpers
│   ├── App.css                 # CSS variables, animations, scrollbars
│   ├── App.jsx                 # Master application router & provider nesting
│   ├── index.html              # HTML shell & font definitions
│   ├── main.jsx                # Application root mount
│   ├── postcss.config.js       # PostCSS configuration
│   ├── tailwind.config.js      # Tailwind theme configuration
│   └── vite.config.js          # Vite build configuration
├── package.json
└── vercel.json                 # SPA routing rewrite rule for deployment
```

---

## 4. Architectural Deep Dive & Core Systems

### 4.1 Authentication, Session Lifecycle & Security (`AuthContext.jsx`)
- **Storage Strategy**: Authentication tokens (`authToken`) and user identity records (`userData`) are stored in `sessionStorage`. This ensures that closing a browser tab or window automatically terminates the administrative session. A startup cleanup routine purges any legacy `localStorage` tokens.
- **Inactivity Auto-Logout**: An activity listener tracks `mousemove`, `mousedown`, `keypress`, `scroll`, and `touchstart` events. Inactivity exceeding **5 minutes** (`SECURITY_CONFIG.sessionTimeout = 300000ms`) automatically executes `logout()` and triggers the non-dismissible `SessionTimeoutModal`.
- **Brute-Force Lockout Defense**: Failed login attempts are recorded. If attempts reach `SECURITY_CONFIG.maxLoginAttempts` (5 attempts), the account is locked for **2 minutes** (`SECURITY_CONFIG.lockoutDuration = 120000ms`). An active countdown displays remaining seconds to the user.
- **Hardware/Device Fingerprinting**: Login requests generate synthetic client device identifiers (`deviceuniqueid` and `devicemodel` from `navigator.userAgent`) and send them as request headers to aid backend device tracking.

### 4.2 Role-Based Access Control (RBAC) (`src/config/constants.js`)
The application supports three hierarchical administrative tiers:
1. **`super_admin`**: Full system permissions, including Admin User creation/deletion, CSV data exports, financials, and password management.
2. **`admin`**: Day-to-day operations (driver verifications, user status toggling, fleet tracking, safety reports, notifications), without access to financial ledgers, promo code creation, or data export.
3. **`general`**: Read-only oversight (birds-eye view, user view only, completed/cancelled ride inspection).

#### Permissions Matrix

| Permission Key | Super Admin | Admin | General | Description |
| :--- | :---: | :---: | :---: | :--- |
| `downloadExcel` | ✅ | ❌ | ❌ | Exporting user, ride, and revenue records to CSV. |
| `approveDriversVehicles` | ✅ | ✅ | ❌ | Approving or rejecting driver licenses, insurance, registrations. |
| `seeSensitiveData` | ✅ | ✅ | ❌ | Viewing unmasked user contact info and financial transactions. |
| `sendNotifications` | ✅ | ✅ | ❌ | Dispatching push notifications to users. |
| `birdsEye` | ✅ | ✅ | ✅ | Viewing the real-time Google Map fleet telemetry. |
| `cancelledRides` | ✅ | ✅ | ✅ | Viewing cancelled ride histories. |
| `vehicleCategory` | ✅ | ✅ | ❌ | Creating or editing vehicle models and ride types. |
| `financials` | ✅ | ❌ | ❌ | Accessing subscription revenue, withdrawals, and ride rate matrix. |
| `promos` | ✅ | ❌ | ❌ | Managing marketing campaigns and discount codes. |
| `balancePoints` | ✅ | ❌ | ❌ | Modifying rewarded balance and credit points. |
| `manageUsers` | ✅ | ✅ | ❌ | Editing user profiles, activating, suspending, or deleting accounts. |
| `viewUsersOnly` | ❌ | ❌ | ✅ | Read-only view of user rosters. |
| `viewDriverRequests` | ✅ | ✅ | ❌ | Accessing driver registration applications. |

Guards are enforced in two places:
1. **Route Level (`ProtectedRoute.jsx`)**: Verifies `hasPermission(permission)` or `hasRole(role)` and renders an "Access Denied" screen if unauthorized.
2. **Navigation Level (`Sidebar.jsx` via `AppContext.jsx`)**: Menu items are dynamically filtered out so unauthorized options are completely hidden from the sidebar.

### 4.3 Network & API Service Layer (`src/lib/services.js`)
- **Instance Configuration**: Axios instance initialized with `baseURL: https://api.example.com/api/admin/` (or configurable via `VITE_BASE_URL`), timeout of 100,000ms, and standard JSON headers.
- **Request Interceptor**: Extracts `authToken` from `sessionStorage` and attaches `Authorization: Bearer <token>`.
- **Response Interceptor**:
  - Automatically handles HTTP `401 Unauthorized` by purging session storage and immediately redirecting to `/auth/login`.
  - Distinguishes between network/server errors and intentional search cancellations, suppressing console spam for aborted requests.
- **Request Cancellation & Anti-Race Guard (`useRequestGuard.js`)**:
  - Provides an `AbortController` signal to Axios requests.
  - When a user types in search boxes (e.g. searching users, drivers, carpools), previous in-flight requests are immediately aborted.
  - `isCurrent()` checks guarantee that out-of-order or late-arriving responses are dropped, preventing table repaints with stale data.
  - `isAbortError()` ensures cancelled searches do not trigger error toast popups.

### 4.4 Dynamic Theming System (`ThemeContext.jsx`)
- Supports **Light Mode** and **Dark Mode** toggle, persisting preference in `localStorage`.
- Converts hexadecimal brand colors (`#61CB08` primary, `#ebc501` secondary) into 11 RGB shades (50 through 950) and injects them dynamically into `:root` CSS custom properties (`--color-primary-500`, etc.).
- Tailwind configuration utilizes dynamic opacity interpolation (`rgb(var(--color-primary-500) / <alpha-value>)`).

---

## 5. Domain Modules & Feature Specifications

### 5.1 Executive Dashboard (`/dashboard`)
- **Metric Cards**: Total Drivers, Active Drivers, Active Riders, Subscription Revenue (USD), Withdrawal Commission Fees (USD).
- **Pending Action Triggers**: Instant indicators for Pending Driver Applications and Unresolved Safety Reports with deep-links to their management pages.
- **Ride Metrics Widget**: Visual breakdown of Total, Completed, and Cancelled rides with progress bars and percentage metrics across Today, This Week, and This Month.
- **Distribution Donut**: SVG-based donut chart displaying ride type share (`luxury`, `economy`, `carpool`).
- **Growth Trends**: 7-day and 30-day new rider and driver registration counters.

### 5.2 User Management (`/user-management`)
- **Segmented Views**: Tabbed data tables for **Riders** and **Drivers**.
- **Search & Filter**: Real-time debounced keyword search, registration date range filtering.
- **Custom CSV Exporter**: Modal allowing selective field inclusion (First Name, Last Name, Email, Phone, Status) and date range filtering, exporting formatted CSV via `Blob` download.
- **Account Actions**: View full details, update user profile, activate/deactivate user, or delete user record.
- **Profile Details**: Dedicated detail pages (`/user-management/rider/:id` and `/user-management/driver/:id`) displaying ride history, lifetime spend, wallet transactions, and ratings.

### 5.3 Driver Onboarding & Document Verification (`/driver-requests`, `/driver/:id`)
- **Applications Queue**: Lists pending driver signups.
- **Interactive Verification Workbench (`DriverDetails.jsx`)**:
  - Detailed driver biographical info, contact info, vehicle specs.
  - Verification checklist covering:
    - **Driver's License** (Front & Back)
    - **Vehicle Registration Certificate**
    - **Vehicle Insurance Document**
    - **Vehicle Exterior & Interior Photographs**
  - **Inspection Image Viewer**: Interactive inspection lightbox with **Zoom In / Zoom Out**, **90° Clockwise / Counter-Clockwise Rotation**, and Fullscreen mode.
  - **Individual Decisioning**: Approve or Reject individual documents and vehicle assets.
  - **Rejection Reason Modal**: Requires an explicit administrative explanation when rejecting a document so the driver receives clear actionable feedback in their mobile application.

### 5.4 Suspended Drivers Management (`/suspended-drivers`)
- **Classification of Suspensions**:
  - `cancellation`: System-automated suspension triggered by excessive driver ride cancellations.
  - `admin_manual`: Timed suspension applied manually by an administrator.
  - `admin_permanent`: Indefinite/permanent platform ban.
- **Live Countdown Timer**: Calculates and displays remaining suspension duration (`Xd Xh Xm`).
- **Suspension Details & Unsuspend Modal**: Inspects historical suspension violations and provides an immediate one-click **Unsuspend Driver** action.

### 5.5 Rewarded Balance Ledger (`/rewarded-balance-history`)
- Tracks promotional loyalty points, referral bonuses, and driver credits.
- Filterable by User Type (`all`, `rider`, `driver`), date ranges, and searchable by user identity.
- Displays credit/debit transaction details, transaction timestamp, and remaining balances.

### 5.6 Vehicle Categories & Mapping (`/vehicle-category`)
- Manages vehicle makes, models, and specifications.
- Maps vehicle models to platform ride tiers (`economy`, `luxury`, `carpool`).
- Validates model uniqueness to prevent conflicting vehicle classifications.
- Provides status toggles to activate or deactivate entire vehicle classes.

### 5.7 Dynamic Pricing & City-Based Mileage Brackets (`/ride-rates`)
The platform employs a two-tier pricing engine:
1. **Global Fallback Pricing**:
   - Used when no specific city rule exists or when a city's rate is disabled.
   - Configured per ride type (`economy`, `luxury`, `carpool`).
   - Supports: Base Fare, Per-Mile Rates (mileage tiers), Per-Minute Rates, Minimum Fare, Cancellation Fee, and Global Discount Percentage.
2. **City-Based Fixed Bracket Pricing**:
   - Configurable across **27 Florida Cities** (Miami, Orlando, Tampa, Jacksonville, Tallahassee, Fort Lauderdale, etc.).
   - Utilizes **Fixed Pricing Brackets** rather than variable per-mile calculations:
     - Bracket 1: `0 - 4` miles
     - Bracket 2: `5 - 9` miles
     - Bracket 3: `10 - 15` miles
     - Bracket 4: `16 - 20` miles
     - Bracket 5: `21+` miles (`maxMiles: null`)
   - Configurable `peakSurchargePerMile` added during active peak hours.
   - Case-insensitive city matching (e.g. `"Miami"`, `" miami "`, `"MIAMI"` resolve identically).
   - Independent lookups for `private` ride requests (calculating Economy and Luxury options independently).

### 5.8 Peak Windows & Surge Pricing (`/peak-windows`)
- Configures surge pricing hours.
- Evaluated against `America/New_York` (Eastern Time) timezone.
- Defined as whole-hour intervals `[startHour, endHour)` from `0` to `24`.
- Strict client-side and server-side validation preventing overlapping peak windows.
- Active toggle allowing administrative enabling/disabling of surge windows without deletion.

### 5.9 Ride Tracking: Private & Carpool Operations
- **Private Rides (`/private-rides`)**:
  - Filter by ride status (`completed`, `cancelled`, `ongoing`) and payment status (`paid`, `pending`, `failed`).
  - Modal viewing detailed ride ID, route coordinates, driver/rider info, vehicle details, distance, duration, fare breakdown, and cancellation reasons.
  - CSV export supporting customized date ranges.
- **Carpool Rides (`/carpool-rides`, `/carpool-rides/:id`)**:
  - Manages multi-passenger shared rides.
  - Tracks total seats, available seats, pickup/drop-off sequences, passenger rosters, and fare collections per seat.
  - Full trip route timeline rendering each stop along the carpool itinerary.

### 5.10 Real-Time Fleet Telemetry: Bird's Eye View (`/birds-eye-view`)
- **Google Maps Integration**: Live map interface centered by default on Florida (`lat: 28.5383, lng: -81.3792`).
- **Polling & Animation**: Polls active driver telemetry every **10 seconds** (`POLL_INTERVAL = 10000ms`), with a 2.5-second easing animation between coordinates.
- **Dynamic Vehicle Heading**: Computes course bearing and rotates custom vector SVG car icons according to actual travel orientation.
- **Fleet Filtering**: Filter active drivers on map by ride category (`economy`, `luxury`, `carpool`) and availability status (`online`, `on_ride`).
- **Driver Info Modal**: Clicking on any vehicle marker opens a modal displaying driver profile, current ride, vehicle plate, phone number, and battery/speed telemetry if available.

### 5.11 Financials & Revenue Streams (`/revenue`)
- **Subscription Revenue**:
  - Audits recurring platform membership fees charged to drivers.
  - Tracks subscription start/end dates, plan tiers, payment status, and Stripe transaction references.
- **Driver Withdrawal Requests**:
  - Manages driver payout requests from their platform earnings wallet.
  - Displays requested amount, administrative commission deductions, net payout, and payment processing status.

### 5.12 Marketing Campaigns & Promo Codes (`/campaigns`, `/campaigns/:id`)
- **Dual Code Modes**:
  - **Public Code**: A single universally usable promo code string (e.g. `SUMMER2026`).
  - **Unique Batch Codes**: Generates a batch of unique random alphanumeric promo codes with a custom prefix and batch quantity (e.g. `VIP-A8F2K`, `VIP-9B3C1`).
- **Discount Rules**: Fixed currency amount or Percentage discount with maximum discount ceiling (`maxDiscountCap`).
- **Eligibility Criteria**: Restrict by Ride Types (`private`, `carpool`), eligible Florida cities, minimum rider age, and target user type (`rider`, `driver`, `all`).
- **Usage Restrictions**: Enforce `maxUsesPerUser` and `totalRedemptionLimit`.
- **Redemptions Tracking**: Inspects individual rider redemptions, redemption dates, and ride IDs.

### 5.13 Safety, Incident Reports & Disputes (`/reports`, `/reports-detail/:id`)
- Tracks incidents flagged by riders or drivers (e.g., safety concerns, vehicle condition, disputes, lost items).
- Status workflow: `pending` ➔ `investigating` ➔ `resolved` / `dismissed`.
- Detailed case screen with reporter narrative, ride details, and admin resolution interface allowing permanent notes to be appended.

### 5.14 Targeted Push Notifications (`/notifications`)
- Broadcasts announcements or targeted push notifications via Firebase Cloud Messaging (FCM).
- **Targeting Modes**:
  - All Users (Global broadcast)
  - Role-based (All Drivers or All Riders)
  - Specific Individual User: Includes an infinite-scrolling `UserPicker` with search and request cancellation guards.
- Tracks dispatch status (`sent`, `scheduled`, `failed`) and notification delivery logs.

### 5.15 Admin Team & Access Management (`/admin-users`)
- Super Admin exclusive area for managing platform operators.
- Create new administrative users with assigned roles (`super_admin`, `admin`, `general`).
- Password reset, role adjustments, and account deactivation.

---

## 6. Developer Guidelines & Engineering Patterns

### 6.1 Adding a New API Endpoint
1. Open `src/lib/services.js`.
2. Define the service function using `apiHandler()`:
   ```javascript
   const getRefundRequests = (page = 1, limit = 10, config) =>
     apiHandler(() => API.get(`/refunds?page=${page}&limit=${limit}`, config));
   ```
3. Expose the function in the exported `api` object.

### 6.2 Preventing Search & Filter Race Conditions
Always employ the `useRequestGuard` and `useDebounce` pattern for text inputs that trigger API requests:
```javascript
import useRequestGuard from "../hooks/global/useRequestGuard";
import useDebounce from "../hooks/global/useDebounce";

const MySearchComponent = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const beginRequest = useRequestGuard();

  const fetchData = useCallback(async () => {
    const { signal, isCurrent } = beginRequest();
    try {
      const res = await api.getUsers(debouncedSearch, { signal });
      if (!isCurrent()) return; // Discard if superseded
      setData(res.data);
    } catch (err) {
      if (!isCurrent() || isAbortError(err)) return; // Ignore aborted searches
      handleError(err);
    }
  }, [debouncedSearch, beginRequest]);
};
```

### 6.3 State Persistence Across Navigation
Use `usePersistentState` instead of standard `useState` when storing table filters, search queries, active tabs, or pagination. This ensures that when an admin navigates into a driver detail page and clicks "Back", their exact table scroll position, page, and active filters are restored from `sessionStorage`.

```javascript
import { usePersistentState } from "../hooks/global/usePersistentState";

const [page, setPage] = usePersistentState("drivers_page", 1);
const [search, setSearch] = usePersistentState("drivers_search", "");
```

### 6.4 Toast & Feedback Standard
Never invoke `toast.error()` or `toast.success()` directly in components without the centralized helpers in `src/utils/helpers.js`:
- `handleError(error)`: Normalizes error formats, checks for aborted requests (silently ignoring them), and formats known backend messages (e.g. unique vehicle model constraints).
- `handleSuccess(message, defaultMessage)`: Displays green success toast.

---

## 7. Build, Environment & Deployment Configuration

### 7.1 Environment Variables (`.env`)
```env
# Google Maps JavaScript API Key (Must have Maps JavaScript API & Geocoding API enabled)
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...

# Optional: Override base API URL (Defaults to https://api.example.com/api/admin/)
VITE_BASE_URL=https://api.example.com/api/admin/

# Optional: Stripe Public Key for Revenue Tracking
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

### 7.2 Running Locally
```bash
# Install dependencies
npm install

# Start development server (Port 5173)
npm run dev

# Build for production (Generates dist/ bundle)
npm run build

# Preview production build locally
npm run preview
```

### 7.3 Deployment (Vercel / SPA Hosting)
Because this is a Single Page Application using HTML5 client-side routing (`react-router-dom`), web servers must rewrite all non-file route requests to `/index.html`.
`vercel.json` is pre-configured with:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 8. Code Review Findings, Optimizations & Recommendations

### 8.1 Critical Issues & Setup Improvements
1. **Missing ESLint Configuration**:
   - `npm run lint` fails because there is no `.eslintrc.cjs` or `eslint.config.js` in the project root.
   - *Recommendation*: Create a standardized `.eslintrc.cjs` configured with React and React Hooks plugins.
2. **Bundle Chunk Size Optimization**:
   - Vite produces a single `dist/assets/index-*.js` bundle exceeding 1.5MB (uncompressed) / 348KB (gzipped).
   - *Recommendation*: Implement route-based lazy loading with `React.lazy()` and `Suspense` in `src/App.jsx`, especially for heavy views such as `BirdsEyeView.jsx` (which loads Google Maps), `RideRates.jsx`, and `DriverDetails.jsx`.
3. **Template Legacy Artifacts**:
   - Files like `src/pages/Products.jsx`, `src/pages/Categories.jsx`, and `src/pages/Orders.jsx` are relics from the starter dashboard template. They are commented out in the sidebar but still present in routes and the API service.
   - *Recommendation*: Safely deprecate or prune these unused files to keep the codebase clean and reduce cognitive load.
4. **Base URL Centralization**:
   - In `src/lib/services.js`, `STAGING_BASE_URL` is hardcoded as `https://api.example.com/api/admin/`. It should be unified to prioritize `import.meta.env.VITE_BASE_URL` from `API_CONFIG.baseURL`.
5. **In-App Documentation Harmonization**:
   - `src/pages/Documentation.jsx` contains generic starter template instructions referring to an external generic template. It should be aligned with the actual Example Rides platform features.

## 9. Dashboard sources and coverage (2026-09-30)

The dashboard uses existing admin endpoints and the current user’s identity visibility. It adds no backend, mobile, database or tracking changes.

| Display | Source and definition |
| --- | --- |
| Registered drivers | Dashboard stats' driver count: visible, non-deleted accounts, including deactivated accounts and registrations with no submissions. |
| Registered riders | Unfiltered rider list's server pagination total, including deactivated accounts; never the page length or dashboard active-rider count. |
| Current activity | Distinct IDs in Bird’s Eye View. Online drivers require map locations. Assigned drivers have a regular ride or carpool assignment; this does not prove pickup. Riders on private trips require an active regular ride in `in-progress`. Searching means `requested`; awaiting pickup means `accepted`, `coming` or `arrived`. Carpool passenger presence and device heartbeat freshness are unavailable. |
| Lifetime subscription collections | Unfiltered subscription revenue `stats.totalRevenue`: successful driver subscription transactions, including renewals. Gross collections, without refund or accounting adjustments. |
| Withdrawal commission | Dashboard withdrawal commission, separately labeled. Both financial cards, their requests and peak configuration links honor `financials`. |
| Pending submissions and reports | Server pending-driver count covers submitted documents/vehicles, not every incomplete registration. Report totals cover all visible cases; the preview contains up to five pending cases with actual reasons, statuses, age and case links. |
| Historical outcomes and categories | Ride analytics combines regular records with individual carpool bookings. Last 7 days, Last 30 days and All time share an explicit creation-time range ending at the selected snapshot instant. Bounds are UTC; rolling days are 24 hours. Categories retain returned labels and counts, shown independently without an invented pie classification. The separate regular-ride table uses the server's Today/Week/Month boundaries. |
| Growth scenarios | Actual rolling 7/30-day registrations, followed by rounded additional registrations at each observed pace. These are estimates, not validated forecasts or future account totals. |

Sources refresh independently: map every 15 seconds, stats/rider totals/collections/reports every 60 seconds while visible. History refreshes on selection and manual refresh. Returning to a visible tab refreshes polled sources without overlapping a pending request; unpolled lists such as Driver Requests and Reports refresh only on demand. Manual refresh may replace one. Successful fetch timestamps survive failed refreshes with a stale indicator; invalid and missing values remain unavailable. Role/source changes clear obsolete data. Financial requests are disabled for unauthorized roles.

Driver Requests receives current vehicle, license, registration and insurance statuses from the pending driver list. The server assigns one primary group: Missing vehicle, Missing documents, Needs correction, Ready for review, Approved requirements or Unknown / review required. Counts cover the whole queue matching the search, before the selected group filter. Filter buttons update the requirements URL parameter, preserve search and reset to page one; browser history restores the selection. Rejected reasons, verified and old statuses, informational expiry labels, and unrelated pending submissions appear in Current Status. CSV export includes the group and four item statuses for the current page. Older servers show list-only submission indicators and an update notice without requirement filters or profile requests. Registrations with no uploads stay outside this queue. Approval of these requirements does not establish subscription or account eligibility. Existing detail review and approval actions remain the review workflow.

Dashboard rider, report and revenue links select their advertised tab/status and reset conflicting search/date/page state where applicable, including previously persisted filters. Registered drivers have no misleading link to the narrower eligible-driver account list.

Download counts, lifetime ride commission, complete unsuccessful-search funnels, historical unmet demand, hourly supply analysis and global onboarding blocker counts remain unavailable with the inspected contracts. Category history has no verified correction date.

Validation:

- `npm run test:dashboard`: focused metric, source validation, requirement display, pagination and resource lifecycle tests using Node's test runner.
- `npx playwright install chromium`, then `npm run test:dashboard:browser`: starts a local Vite server on port 4174 and mocks every admin API request. Covers desktop/390px layouts, light/dark styling, loading/empty/unavailable/stale/partial failure, permissions, scoped links, whole-queue requirement counts, URL group filters/history, empty groups, CSV export, legacy server mode, absence of driver detail requests and actual React Strict Mode/visibility/identity/unmount behavior. Screenshot artifacts go to ignored `node_modules/.dashboard-verification/`. Playwright is a development dependency and requires Node 20+.
- `npm run build`: production bundle validation.
- The repository `npm run lint` remains blocked by its pre-existing missing ESLint configuration. Focused syntax, unused-variable and React Hooks checks can run with explicit ESLint CLI configuration; those passed for the new dashboard code.

Verification uses fixtures rather than authenticated production responses. No deployment, approvals, report resolutions, notifications or pricing updates are performed by these checks.

### Familiar dashboard layout and interactions

The dashboard retains the investor-facing organization shown in the existing production screenshots: three compact summary cards followed by two financial cards, amber/red review strips, Ride Metrics beside Ride Type Distribution, and separate rider/driver registration panels. Default spacing, white surfaces, colored values, tinted icons and registration tiles follow that view. Accurate labels and permission checks remain in place; the rider account total is available in the rider registration panel.

Metric definitions, successful fetch timestamps, report cases, coverage notes and pace estimates open on demand. Initial loading and failed/stale sources remain visible. The shared 7/30-day/all-time selector controls both ride panels. Category rows support mouse hover, keyboard focus and click-to-pin; the circle displays the total record count or the selected category count. Independent bars and the table preserve overlapping categories without inventing a pie share. Registration panels offer optional charts, tables and additional-registration scenarios. Header actions link to the existing notification/report workflows.

The protected app shell contains one content scrollbar. A positioned main region contains hidden table captions; bounded flex children prevent document overflow. Browser verification now checks document/body heights as well as content width and control bounds, including table/expanded states, 1920px/1440px/390px screens and both themes. Orca's embedded browser was also used to verify category selection, table values and the absence of document scrolling.

The ignored local environment targets the production API at `http://localhost:3001`; authenticated metrics still require a normal admin sign-in. The separate Orca preview at `http://localhost:4175` uses sample data only.
