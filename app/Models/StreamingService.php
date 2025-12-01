<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StreamingService extends Model
{
    protected $table = 'streaming_services';
    protected $fillable = [
        'name',
        'slug',
        'logo_url',
        'primary_color',
        'is_active'
    ];
}
