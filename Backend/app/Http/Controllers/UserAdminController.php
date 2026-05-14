<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserAdminController extends Controller
{
    public function toggle(User $user)
    {
        $nuevo = !$user->is_active;
        $user->update(['is_active' => $nuevo]);

        if (!$nuevo) {
            $user->tokens()->delete();
        }

        return response()->json(['ok' => true, 'is_active' => $nuevo]);
    }

    public function syncRoles(Request $request, User $user)
    {
        $request->validate([
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        $user->roles()->sync($request->role_ids);

        return response()->json([
            'ok' => true,
            'roles' => $user->roles()->get(),
        ]);
    }
}
