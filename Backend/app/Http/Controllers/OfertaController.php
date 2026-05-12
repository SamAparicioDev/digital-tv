<?php

namespace App\Http\Controllers;

use App\Models\Oferta;
use App\Models\CuentaStreaming;
use App\Models\PerfilStreaming;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class OfertaController extends Controller
{
    // ── Stock calculado desde cuentas/perfiles sin asignar ────────────────────

    private function computarStock(Oferta $oferta): int
    {
        $servicio = $oferta->servicios->first();
        if (!$servicio) return 0;

        if ($oferta->cuenta_completa) {
            return CuentaStreaming::where('streaming_service_id', $servicio->id)
                ->where('is_active', true)
                ->whereDoesntHave('credencial')
                ->count();
        }

        // Excluye perfiles de cuentas que ya fueron vendidas como cuenta completa
        return PerfilStreaming::where('is_active', true)
            ->whereDoesntHave('credencial')
            ->whereHas('cuenta', fn($q) =>
                $q->where('streaming_service_id', $servicio->id)
                  ->where('is_active', true)
                  ->whereDoesntHave('credencial')
            )
            ->count();
    }

    private function inyectarStock(Oferta $oferta): Oferta
    {
        $oferta->stock = $this->computarStock($oferta);
        return $oferta;
    }

    // ── Endpoint público: cantidad disponible para el formulario de ofertas ────

    public function stockDisponible(Request $request)
    {
        $request->validate([
            'servicio_id'    => ['required', 'integer', Rule::exists('streaming_services', 'id')],
            'cuenta_completa' => 'required|boolean',
        ]);

        $servicioId    = (int) $request->servicio_id;
        $cuentaCompleta = filter_var($request->cuenta_completa, FILTER_VALIDATE_BOOLEAN);

        if ($cuentaCompleta) {
            $count = CuentaStreaming::where('streaming_service_id', $servicioId)
                ->where('is_active', true)
                ->whereDoesntHave('credencial')
                ->count();
        } else {
            $count = PerfilStreaming::where('is_active', true)
                ->whereDoesntHave('credencial')
                ->whereHas('cuenta', fn($q) =>
                    $q->where('streaming_service_id', $servicioId)->where('is_active', true)
                )
                ->count();
        }

        return response()->json(['stock' => $count]);
    }

    // ── Batch stock computation (2 queries para todas las ofertas) ────────────

    private function batchStock(iterable $ofertas): void
    {
        // Recolectar service_ids únicos usados en las ofertas
        $servicioIds = collect($ofertas)->map(fn($o) => $o->servicios->first()?->id)->filter()->unique()->values();

        if ($servicioIds->isEmpty()) return;

        // Cuentas completas disponibles por servicio
        $cuentasCounts = DB::table('cuentas_streaming as c')
            ->where('c.is_active', true)
            ->whereIn('c.streaming_service_id', $servicioIds)
            ->whereNotExists(fn($q) =>
                $q->from('compra_credencial')
                  ->whereColumn('compra_credencial.cuenta_id', 'c.id')
                  ->whereNull('compra_credencial.perfil_id')
            )
            ->groupBy('c.streaming_service_id')
            ->selectRaw('c.streaming_service_id, COUNT(*) as cuenta')
            ->pluck('cuenta', 'streaming_service_id');

        // Perfiles disponibles por servicio (excluye cuentas vendidas como completas)
        $perfilesCounts = DB::table('perfiles_streaming as p')
            ->join('cuentas_streaming as c', 'p.cuenta_id', '=', 'c.id')
            ->where('p.is_active', true)
            ->where('c.is_active', true)
            ->whereIn('c.streaming_service_id', $servicioIds)
            ->whereNotExists(fn($q) =>
                $q->from('compra_credencial')
                  ->whereColumn('compra_credencial.perfil_id', 'p.id')
            )
            ->whereNotExists(fn($q) =>
                $q->from('compra_credencial')
                  ->whereColumn('compra_credencial.cuenta_id', 'c.id')
                  ->whereNull('compra_credencial.perfil_id')
            )
            ->groupBy('c.streaming_service_id')
            ->selectRaw('c.streaming_service_id, COUNT(p.id) as cuenta')
            ->pluck('cuenta', 'streaming_service_id');

        foreach ($ofertas as $oferta) {
            $sid = $oferta->servicios->first()?->id;
            $oferta->stock = $sid
                ? (int) ($oferta->cuenta_completa
                    ? ($cuentasCounts[$sid] ?? 0)
                    : ($perfilesCounts[$sid] ?? 0))
                : 0;
        }
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    public function index()
    {
        $ofertas = Oferta::with('servicios')->get();
        $this->batchStock($ofertas);
        return response()->json($ofertas, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'garantia_dias'   => 'required|integer|min:0',
            'precio'          => 'required|numeric|min:0.01',
            'cuenta_completa' => 'present|boolean',
            'is_active'       => 'present|boolean',

            'servicios_incluidos'                          => 'required|array|min:1',
            'servicios_incluidos.*.streaming_service_id'   => ['required', 'integer', Rule::exists('streaming_services', 'id')],
            'servicios_incluidos.*.numero_perfiles'        => 'required|integer|min:1',
            'servicios_incluidos.*.duracion_dias'          => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            $oferta = Oferta::create(array_merge(
                $request->except('servicios_incluidos'),
                ['stock' => 0]
            ));

            $serviciosData = collect($request->servicios_incluidos)->mapWithKeys(fn($item) => [
                $item['streaming_service_id'] => [
                    'numero_perfiles' => $item['numero_perfiles'],
                    'duracion_dias'   => $item['duracion_dias'],
                    'is_active'       => $item['is_active'] ?? true,
                ]
            ])->toArray();

            $oferta->servicios()->attach($serviciosData);

            DB::commit();

            $oferta->load('servicios');
            $this->inyectarStock($oferta);

            return response()->json($oferta, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error creando oferta: " . $e->getMessage());
            return response()->json(['message' => 'Error al crear la oferta.', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Oferta $oferta)
    {
        $oferta->load('servicios');
        $this->inyectarStock($oferta);
        return response()->json($oferta, 200);
    }

    public function update(Request $request, Oferta $oferta)
    {
        $request->validate([
            'garantia_dias'   => 'nullable|integer|min:0',
            'precio'          => 'nullable|numeric|min:0.01',
            'cuenta_completa' => 'nullable|boolean',
            'is_active'       => 'nullable|boolean',

            'servicios_incluidos'                          => 'nullable|array',
            'servicios_incluidos.*.streaming_service_id'   => ['required', 'integer', Rule::exists('streaming_services', 'id')],
            'servicios_incluidos.*.numero_perfiles'        => 'required|integer|min:1',
            'servicios_incluidos.*.duracion_dias'          => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            $oferta->update($request->except(['servicios_incluidos', 'stock']));

            if ($request->has('servicios_incluidos')) {
                $serviciosData = collect($request->servicios_incluidos)->mapWithKeys(fn($item) => [
                    $item['streaming_service_id'] => [
                        'numero_perfiles' => $item['numero_perfiles'],
                        'duracion_dias'   => $item['duracion_dias'],
                        'is_active'       => $item['is_active'] ?? true,
                    ]
                ])->toArray();

                $oferta->servicios()->sync($serviciosData);
            }

            DB::commit();

            $oferta->load('servicios');
            $this->inyectarStock($oferta);

            return response()->json($oferta, 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error actualizando oferta: " . $e->getMessage());
            return response()->json(['message' => 'Error al actualizar la oferta.', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Oferta $oferta)
    {
        try {
            $oferta->delete();
            return response()->json(['message' => 'Oferta eliminada exitosamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'No se pudo eliminar la oferta.'], 500);
        }
    }
}
