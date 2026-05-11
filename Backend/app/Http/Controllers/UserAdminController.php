<?php

namespace App\Http\Controllers;

use App\Models\User;

class UserAdminController extends Controller
{
    public function toggle(User $user)
    {
        $nuevo = !$user->is_active;
        $user->update(['is_active' => $nuevo]);

        // Revocar tokens si se desactiva
        if (!$nuevo) {
            $user->tokens()->delete();
        }

        return response()->json([
            'ok'        => true,
            'is_active' => $nuevo,
        ]);
    }
}
