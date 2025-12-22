<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class LearnersController extends Controller
{
    public function getRegistrationTrend(Request $request){
        $monthlyTrendInstructors = DB::table('instructor_applications')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as registrationMonth'),
                DB::raw('COUNT(*) as totalApplications')
            )
            ->groupBy('registrationMonth')
            ->orderBy('registrationMonth', 'asc')
            ->get();

        $monthlyTrend = DB::table('learners')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as registrationMonth' ),
                DB::raw('COUNT(*) as totalRegistrations')
            )
            ->groupBy('registrationMonth')
            ->orderBy('registrationMonth', 'asc')
            ->get();
        
        $instructorMap = $monthlyTrendInstructors->keyBy('registrationMonth')->all();
        $learnerMap = $monthlyTrend->keyBy('registrationMonth')->all();

        $allMonths = array_keys($instructorMap + $learnerMap);
        sort($allMonths);

        $combinedTrend = collect($allMonths)->map(function ($month) use ($instructorMap, $learnerMap) {
            $instructorItem = $instructorMap[$month] ?? null;
            $learnerItem = $learnerMap[$month] ?? null;

            $applications = $instructorItem ? $instructorItem->totalApplications : 0;
            $registrations = $learnerItem ? $learnerItem->totalRegistrations : 0;

            return [
                'registrationMonth' => $month,
                'Learners' => $registrations,
                'Instructors' => $applications,
            ];
        })->values()->all();

        // not using right now😍
        // $dailyTrend = DB::table('learners')
        //     ->select(
        //         DB::raw('DATE(created_at) as registrationDate'),
        //         DB::raw('COUNT(*) as totalRegistrations')
        //     )
        //     ->groupBy('registrationDate')
        //     ->orderBy('registrationDate', 'asc')
        //     ->get();

        // $yearlyTrend = DB::table('learners')
        //     ->select(
        //         DB::raw('YEAR(created_at) as registrationYear'),
        //         DB::raw('COUNT(*) as totalRegistrations')
        //     )
        //     ->groupBy('registrationYear')
        //     ->orderBy('registrationYear', 'asc')
        //     ->get();
        
        // for future USE 
        // return response()->json([
        //     ... (array) $monthlyTrend,
        //     ... (array) $dailyTrend,
        //     ... (array) $yearlyTrend,
        // ]);

        return response()->json($combinedTrend);
    }
}
