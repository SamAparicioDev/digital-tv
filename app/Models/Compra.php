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

    /**
     * El usuario que realizó la compra.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * La oferta que se compró.
     */
    public function oferta(): BelongsTo
    {
        return $this->belongsTo(Oferta::class);
    }

    /**
     * La transacción financiera asociada a esta compra.
     */
    public function transaccion(): BelongsTo
    {
        // Asumiendo que tienes un modelo Transaccion
        return $this->belongsTo(Transaccion::class);
    }
}
