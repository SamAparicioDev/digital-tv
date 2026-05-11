<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function imagen(Request $request)
    {
        $request->validate([
            'file'    => 'required|file|mimes:jpg,jpeg,png,webp,gif,svg|max:4096',
            'carpeta' => 'nullable|string|max:50|alpha_dash',
        ]);

        $carpeta = $request->input('carpeta', 'imagenes');
        $path    = $request->file('file')->store($carpeta, 'public');

        return response()->json([
            'ok'  => true,
            'url' => url("storage/{$path}"),
        ]);
    }
}
