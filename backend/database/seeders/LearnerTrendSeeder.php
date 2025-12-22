<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use App\Models\User;

class LearnerTrendSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('en_PH');
        
        // 1. Get all existing user IDs
        $userIds = User::pluck('id')->toArray();
        if (empty($userIds)) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        // Determine how many applications to create
        $minApplications = 50; 
        $maxApplications = 100;
        $numberOfRecords = $faker->numberBetween($minApplications, $maxApplications);

        $now = now();
        $oneYearAgo = now()->subMonths(12);

        $applications = [];

        for ($i = 0; $i < $numberOfRecords; $i++) {
            if (empty($userIds)) break;

            $userId = $faker->unique()->randomElement($userIds);
            $applicationDate = $faker->dateTimeBetween($oneYearAgo, $now);
            
            $firstName = $faker->firstName();
            $lastName = $faker->lastName();

            // --- IMPROVED AVATAR LOGIC ---
            // 70% Real Photos (Picsum), 30% Character Illustrations (DiceBear)
            if ($faker->boolean(70)) {
                // Picsum photo seeded by User ID so it stays consistent for that user
                $avatarUrl = "https://picsum.photos/seed/" . $userId . "/400/400";
            } else {
                // DiceBear 'Avataaars' style - a unique character based on their name
                $seed = urlencode($firstName . $lastName);
                $avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed={$seed}";
            }

            // Update the User record with the new avatar URL
            User::where('id', $userId)->update(['avatar' => $avatarUrl]);
            // -----------------------------

            $applications[] = [
                'user_id' => $userId,
                'first_name' => $firstName,
                'middle_initial' => strtoupper($faker->randomLetter()),
                'last_name' => $lastName,
                'date_of_birth' => $faker->date('Y-m-d', '-30 years'),
                'phone_number' => $faker->phoneNumber(),
                'address' => $faker->address(),
                'bio' => $faker->paragraph(2),
                'experience' => $faker->numberBetween(1, 15) . ' years teaching experience in ' . $faker->randomElement(['Math', 'Science', 'English', 'History']),
                'status' => $faker->randomElement(['pending', 'approved', 'rejected']), 
                'created_at' => $applicationDate,
                'updated_at' => $applicationDate,
            ];
            
            // Maintain uniqueness in the loop
            $key = array_search($userId, $userIds);
            if ($key !== false) {
                unset($userIds[$key]);
            }
        }

        // Insert the instructor applications
        DB::table('instructor_applications')->insert($applications);

        $this->command->info("Seeded {$numberOfRecords} applications. All users now have Picsum or DiceBear avatars!");
    }
}