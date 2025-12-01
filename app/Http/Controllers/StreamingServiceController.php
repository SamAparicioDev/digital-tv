<?php
namespace App\Http\Controllers;

use App\Models\StreamingService;
use Illuminate\Http\Request;
use Illuminate\Support\Str; // Importante para el Slug

class StreamingServiceController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validar
        $request->validate([
            'name' => 'required|unique:streaming_services',
            'logo_url' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
            'primary_color' => 'nullable|string|max:23',
            'is_active'  => 'present|boolean'
        ]);

        $data = $request->all();

        $data['slug'] = Str::slug($request->name);

        if ($request->hasFile('logo')) {

            $path = $request->file('logo')->store('logos', 'public');
            $data['logo_url'] = $path;
        }

        $streamingService = StreamingService::create($data);

        return response()->json($streamingService, 201);
    }
}
