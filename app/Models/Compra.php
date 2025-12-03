<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Compra extends Model
{
    use HasFactory;

    protected $table = 'compras';

    protected $fillable = [
        'user_id',
        'oferta_id',
        'transaccion_id',
        'precio_compra',
        'estado',
        'datos_acceso',
        'nota'
    ];

    protected $casts = [
        'precio_compra' => 'float',
    ];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function oferta(): BelongsTo
    {
        return $this->belongsTo(Oferta::class);
    }
    public function transaccion(): BelongsTo
    {
        return $this->belongsTo(Transaccion::class);
    }
}
