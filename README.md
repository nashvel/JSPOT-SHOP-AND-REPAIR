# Advanced Point of Sale System

A comprehensive, multi-branch POS system built with Laravel, Inertia.js, Vue 3, and TypeScript. Designed for motor shops with support for sales, reservations, inventory management, and public e-commerce features.

## Features

### Core Features
- **Multi-Branch Management**: Main branch can track all branch sales and inventory
- **Dynamic POS Interface**: Fast, responsive point-of-sale with barcode scanning
- **Public E-Commerce**: Customers can view products and make reservations online
- **Order Tracking**: Customers can check order status using order numbers
- **Inventory Management**: Real-time stock tracking across all branches
- **Customer Management**: Track customer information and purchase history

### Advanced Features
- **Role-Based Access Control**: Dynamic permissions for different user roles
- **User Impersonation**: Developers can impersonate any user for testing/support
- **Barcode Support**: Scan products using barcode readers
- **Multiple Payment Methods**: Cash, card, bank transfer, e-wallets
- **Reservation System**: Customers can reserve items and check completion status
- **Support Ticketing**: Built-in IT support contact system
- **Dynamic Custom Fields**: Extensible data structure for products and orders

### Security Features
- **CSRF Protection**: Laravel's built-in CSRF protection
- **SQL Injection Prevention**: Eloquent ORM with prepared statements
- **XSS Protection**: Vue.js automatic escaping
- **Authentication**: Laravel Sanctum for API authentication
- **Role-Based Authorization**: Spatie Permission package
- **Password Hashing**: Bcrypt hashing
- **Session Security**: Secure session management

## Tech Stack

- **Backend**: Laravel 12
- **Frontend**: Vue 3 + TypeScript
- **Bridge**: Inertia.js
- **Database**: MySQL
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (recommended)
- **Authentication**: Laravel Sanctum
- **Permissions**: Spatie Laravel Permission

## Installation

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+

### Setup Steps

1. **Clone and Install Dependencies**
```bash
cd advanced-pos-system
composer install
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
php artisan key:generate
```

3. **Database Setup**
Edit `.env` file with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=advanced_pos
DB_USERNAME=root
DB_PASSWORD=your_password
```

4. **Run Migrations and Seeders**
```bash
php artisan migrate:fresh --seed
```

5. **Publish Vendor Assets**
```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

6. **Build Frontend Assets**
```bash
npm run dev
```

7. **Start Development Server**
```bash
php artisan serve
```

Visit `http://localhost:8000`

## Default Credentials

### Developer Account
- Email: `dev@motorshop.com`
- Password: `password`
- Role: Developer (full access + impersonation)

### Admin Account
- Email: `admin@motorshop.com`
- Password: `password`
- Role: Admin (full management access)

## User Roles & Permissions

### Developer
- Full system access
- User impersonation
- System configuration
- All admin permissions

### Admin
- Manage all branches
- User management
- Product & inventory management
- View all reports
- Manage settings

### Manager
- Branch-specific management
- Product & inventory management
- Customer management
- View branch reports

### Cashier
- Process sales
- View dashboard
- Basic customer lookup

## API Endpoints

### Public API
- `GET /` - Public shop view
- `POST /api/public/reservations` - Create reservation
- `GET /order/{orderNumber}` - Check order status

### Authenticated API
- `GET /dashboard` - Dashboard with stats
- `GET /pos` - POS interface
- `POST /pos` - Process order
- `GET /api/pos/search-barcode` - Search by barcode
- `GET /users` - User management (admin+)
- `POST /users/{user}/impersonate` - Impersonate user (developer only)

## Database Schema

### Key Tables
- `branches` - Store locations
- `users` - System users with branch assignment
- `products` - Product catalog
- `categories` - Product categories
- `branch_inventory` - Branch-specific stock levels
- `customers` - Customer information
- `orders` - Sales, reservations, and service orders
- `order_items` - Order line items
- `payments` - Payment records
- `support_tickets` - IT support tickets

## Customization

### Adding Custom Fields
Products and orders support JSON custom fields:

```php
$product->custom_fields = [
    'warranty_months' => 12,
    'supplier' => 'ABC Motors',
    'color' => 'Red'
];
```

### Adding Payment Methods
Edit the payment method options in:
- `app/Http/Controllers/POSController.php`
- Frontend payment components

### Branch Settings
Each branch can have custom settings stored as JSON:

```php
$branch->settings = [
    'tax_rate' => 0.12,
    'receipt_footer' => 'Thank you!',
    'allow_credit' => true
];
```

## Production Deployment

1. **Environment**
```bash
APP_ENV=production
APP_DEBUG=false
```

2. **Optimize**
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
npm run build
```

3. **Security**
- Enable HTTPS
- Set secure session cookies
- Configure CORS properly
- Use strong database passwords
- Enable rate limiting
- Regular security updates

4. **Performance**
- Enable Redis for caching
- Configure queue workers
- Use CDN for assets
- Enable database indexing
- Optimize images

## Troubleshooting

### Common Issues

**Migration Errors**
```bash
php artisan migrate:fresh --seed
```

**Permission Errors**
```bash
php artisan cache:clear
php artisan config:clear
composer dump-autoload
```

**Frontend Not Loading**
```bash
npm run build
php artisan view:clear
```

## Support

For issues and feature requests, use the built-in support ticket system or contact your system administrator.

## License

Proprietary - All rights reserved

## Development Team

Built with ❤️ for modern retail businesses
# JSPOT-CARS---MOTORS
