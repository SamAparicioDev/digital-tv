<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SiteSettingController extends Controller
{
    /** Defaults — se usan si no hay valor guardado */
    private const DEFAULTS = [
        'site_name'                 => 'DigitalTv',
        'site_description'          => 'Tu plataforma de streaming premium',
        'support_email'             => 'soporte@digitaltv.com',
        'whatsapp_number'           => '+57 322 3570025',
        'support_phone'             => '+57 322 3570025',
        'support_address'           => 'Colombia',
        'enable_notifications'      => '1',
        'enable_email_alerts'       => '1',
        'enable_whatsapp_alerts'    => '0',
        'maintenance_mode'          => '0',
        'require_email_verification'=> '1',
        'min_recharge_amount'       => '10000',
        'max_recharge_amount'       => '500000',
        'commission_percent'        => '5',
        'welcome_bonus'             => '0',
    ];

    /** GET /api/settings — públicas, fusionadas con defaults */
    public function index()
    {
        $data = Cache::remember('site_settings', 300, function () {
            $stored = SiteSetting::pluck('value', 'key')->toArray();
            return array_merge(self::DEFAULTS, $stored);
        });
        return response()->json($data);
    }

    /** PUT /api/admin/settings — recibe { key: value, ... } y guarda todo */
    public function update(Request $request)
    {
        // Aceptamos cualquier par key/value (string)
        $payload = $request->validate([
            '*' => 'nullable',
        ]);

        foreach ($request->all() as $key => $value) {
            // Normalizamos a string para guardar uniformemente
            $stringValue = is_bool($value)
                ? ($value ? '1' : '0')
                : (is_null($value) ? null : (string) $value);

            SiteSetting::updateOrCreate(['key' => $key], ['value' => $stringValue]);
        }

        Cache::forget('site_settings');

        $stored = SiteSetting::pluck('value', 'key')->toArray();
        return response()->json([
            'ok'       => true,
            'message'  => 'Configuración guardada',
            'settings' => array_merge(self::DEFAULTS, $stored),
        ]);
    }
}
