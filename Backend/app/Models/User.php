<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Rol::class, 'usuario_rol', 'usuario_id', 'rol_id');
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function compras(): HasMany
    {
        return $this->hasMany(Compra::class);
    }

    // --- LÓGICA DE AUTORIZACIÓN ---

    public function obtenerPrivilegios()
    {
        if ($this->roles->isEmpty()) {
            return collect();
        }

        return $this->roles->flatMap(function ($rol) {
            return $rol->privilegios->pluck('nombre');
        })->unique();
    }

    public function hasRole($nombreRol)
    {
        return $this->roles->contains('nombre', $nombreRol);
    }

    public function hasPrivilege($nombrePrivilegio)
    {
        return $this->obtenerPrivilegios()->contains($nombrePrivilegio);
    }
}
