<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany; // Importante

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

    public function roles()
    {
        return $this->belongsToMany(Rol::class);
    }

    public function privilegios()
    {
        return $this->roles->flatMap->privilegios->pluck('clave')->unique();
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    // ✅ NUEVA RELACIÓN
    public function compras(): HasMany
    {
        return $this->hasMany(Compra::class);
    }
}
