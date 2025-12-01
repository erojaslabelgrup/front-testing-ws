# Configuración CORS para Laravel

Para solucionar el error de CORS, necesitas configurar tu backend de Laravel.

## Opción 1: Configurar CORS en Laravel (Recomendado)

En tu proyecto Laravel `mia-v2.test`, edita el archivo `config/cors.php`:

```php
return [
    'paths' => ['api/*', 'broadcasting/auth', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'], // En producción, especifica tu dominio

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
```

## Opción 2: Middleware CORS personalizado

Si quieres más control, puedes crear un middleware en Laravel:

```bash
php artisan make:middleware Cors
```

En `app/Http/Middleware/Cors.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;

class Cors
{
    public function handle($request, Closure $next)
    {
        return $next($request)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }
}
```

Y registrarlo en `app/Http/Kernel.php`:

```php
protected $middleware = [
    // ...
    \App\Http\Middleware\Cors::class,
];
```

## Opción 3: Configurar en la ruta específica

En `routes/channels.php` o donde configures Broadcasting:

```php
Route::middleware(['cors'])->group(function () {
    Broadcast::routes();
});
```

## Verificar que el middleware está activo

Asegúrate de que el middleware CORS de Laravel está registrado en `app/Http/Kernel.php`:

```php
protected $middlewareGroups = [
    'web' => [
        // ...
        \Illuminate\Http\Middleware\HandleCors::class,
    ],
];
```

## Nota importante

El endpoint `/broadcasting/auth` debe estar accesible y responder con los headers CORS correctos. 
Verifica que el token Bearer sea válido en tu aplicación Laravel.
