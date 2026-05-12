<?php

namespace App\Http\Controllers;

use App\Models\TutorialCategoria;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Cache;

class TutorialCategoriaController extends Controller
{
    public function index()
    {
        $data = Cache::remember('tutorial_categorias', 300, fn() =>
            TutorialCategoria::orderBy('nombre')->get()
        );
        return response()->json($data);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'      => 'required|string|max:255|unique:tutorial_categorias',
            'descripcion' => 'nullable|string|max:500',
            'is_active'   => 'boolean',
        ]);

        $cat = TutorialCategoria::create($request->only(['nombre', 'descripcion', 'is_active']));
        Cache::forget('tutorial_categorias');
        return response()->json($cat, 201);
    }

    public function update(Request $request, TutorialCategoria $categoria)
    {
        $request->validate([
            'nombre'      => ['sometimes', 'required', 'string', 'max:255', Rule::unique('tutorial_categorias')->ignore($categoria->id)],
            'descripcion' => 'nullable|string|max:500',
            'is_active'   => 'boolean',
        ]);

        $categoria->update($request->only(['nombre', 'descripcion', 'is_active']));
        Cache::forget('tutorial_categorias');
        return response()->json($categoria);
    }

    public function destroy(TutorialCategoria $categoria)
    {
        $categoria->delete();
        Cache::forget('tutorial_categorias');
        return response()->json(['message' => 'Categoría eliminada']);
    }
}
