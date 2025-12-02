<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany; // 1. Importación necesaria

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // --- RELACIONES ---

    public function roles(): BelongsToMany
    {
        // 2. Especificamos la tabla pivote 'usuario_rol' para evitar errores
        return $this->belongsToMany(Rol::class, 'usuario_rol');
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function compras(): HasMany
    {
        return $this->hasMany(Compra::class);
    }

    // --- LÓGICA DE AUTORIZACIÓN (NUEVA) ---

    /**
     * Obtiene una lista plana de todos los nombres de privilegios del usuario.
     */
    public function obtenerPrivilegios()
    {
        // Si los roles no están cargados, devolvemos colección vacía para evitar errores
        if ($this->roles->isEmpty()) {
            return collect();
        }

        // Recorremos los roles y extraemos los nombres de los privilegios
        return $this->roles->flatMap(function ($rol) {
            return $rol->privilegios->pluck('nombre');
        })->unique();
    }

    /**
     * Verifica si el usuario tiene un rol específico (por nombre).
     * Uso: $user->hasRole('admin')
     */
    public function hasRole($nombreRol)
    {
        // contains busca si existe algún rol con ese nombre en la colección
        return $this->roles->contains('nombre', $nombreRol);
    }

    /**
     * Verifica si el usuario tiene un privilegio específico.
     * Uso: $user->hasPrivilege('ver_dashboard')
     */
    public function hasPrivilege($nombrePrivilegio)
    {
        return $this->obtenerPrivilegios()->contains($nombrePrivilegio);
    }
}
